
const task = await taskSpaces.useOrCreate('gongtong sheet insta')
const HANDLES = __H__;
const MAXP = __M__;
for (const h of HANDLES) {
  try {
    await page.goto('https://www.instagram.com/' + h + '/', { timeout: 30000 })
    try { await page.waitForFunction(() => document.querySelectorAll('a[href*="/p/"],a[href*="/reel/"]').length > 0 || document.title.includes('Page not found'), { timeout: 12000 }) } catch (e) {}
    await page.waitForTimeout(1200)
    const prof = await page.evaluate(String.raw`(() => {
      const md = document.querySelector('meta[name=description]')?.content || '';
      const og = document.querySelector('meta[property="og:image"]')?.content || '';
      const links = [...document.querySelectorAll('a[href*="/p/"],a[href*="/reel/"]')].map(a=>({h:a.getAttribute('href'), img:a.querySelector('img')?.src||'', alt:a.querySelector('img')?.alt||'', pin: !!a.querySelector('svg[aria-label*="Pin"],svg[aria-label*="고정"]'), vid: !!a.querySelector('svg[aria-label*="Clip"],svg[aria-label*="Reel"],svg[aria-label*="릴스"],svg[aria-label*="Video"]'), car: !!a.querySelector('svg[aria-label*="Carousel"],svg[aria-label*="슬라이드"]')}));
      return {title: document.title, md, og, header: document.querySelector('header')?.innerText || '', links};
    })()`)
    const posts = []
    for (const L of prof.links.slice(0, MAXP)) {
      const m = L.h.match(/\/(p|reel)\/([^\/]+)/); if (!m) continue
      const sc = m[2]
      const e = await page.evaluate(String.raw`(async () => {
        try {
          const res = await fetch('/p/' + ${JSON.stringify(sc)} + '/embed/captioned/', {credentials:'include'});
          const t = await res.text();
          const d = new DOMParser().parseFromString(t,'text/html');
          const sp = d.querySelector('.SocialProof')?.innerText || '';
          const cap = d.querySelector('.Caption');
          let capt = '';
          if (cap) { cap.querySelectorAll('br').forEach(b=>b.replaceWith('\n')); capt = cap.innerText || cap.textContent || ''; }
          const vc = t.match(/video_view_count\\?":(\d+)/);
          const lc = t.match(/edge_liked_by\\?":\{\\?"count\\?":(\d+)/);
          const cc = t.match(/edge_media_to_comment\\?":\{\\?"count\\?":(\d+)/) || t.match(/comment_count\\?":(\d+)/);
          const ts = t.match(/taken_at_timestamp\\?":(\d+)/);
          const img = d.querySelector('img.EmbeddedMediaImage')?.getAttribute('src') || '';
          const isv = !!d.querySelector('.Embed.Video, video, .EmbeddedMediaVideo') || /is_video\\?":true/.test(t);
          return {s: res.status, sp, capt: capt.slice(0, 2500), vc: vc&&+vc[1], lc: lc&&+lc[1], cc: cc&&+cc[1], ts: ts&&+ts[1], img, isv};
        } catch (err) { return {err: String(err)} }
      })()`)
      posts.push({sc, kind: m[1], grid_img: L.img, alt: L.alt, pin: L.pin, vid: L.vid, car: L.car, ...e})
      await page.waitForTimeout(350)
    }
    console.log('@@' + JSON.stringify({h, t: new Date().toISOString(), ...prof, links: undefined, posts}))
  } catch (err) {
    console.log('@@' + JSON.stringify({h, err: String(err)}))
  }
  await page.waitForTimeout(1500)
}
