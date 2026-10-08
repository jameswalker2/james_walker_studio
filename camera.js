/* ==========================================================
   camera.js — builds the 3D camera (Canon R6 II style, no lens)

   The idea: a 3D object is just flat rectangles and discs placed
   in 3D space with CSS transforms. This file has 4 small helpers
   (box, disc, rect, cyl) and then uses them to "assemble" the camera.

   Coordinates (all in pixels, 0,0,0 = center of the camera body):
     x: left (-) / right (+)
     y: up (-)   / down (+)     <- y is upside down in CSS!
     z: away from you (-) / toward you (+)
   ========================================================== */

(function () {
  // Where everything gets added (the empty <div id="model"> in index.html)
  var model = document.getElementById('model');

  /* ---------- HELPER 1: box ----------
     Makes a 3D box from 6 flat faces.
     w = width, h = height, d = depth
     x, y, z = where its center is
     c = which CSS class (material) each face uses, e.g. {front:'rubber'}
     inner = optional HTML to put inside a face, e.g. {back: '<div>...</div>'} */
  function box(w, h, d, x, y, z, c, inner) {
    c = c || {};
    inner = inner || {};

    var g = document.createElement('div');
    g.className = 'bx';
    g.style.transform = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)';

    // each face: [name, width, height, how to rotate/push it into place]
    var faces = [
      ['front',  w, h, 'translateZ(' + d / 2 + 'px)'],
      ['back',   w, h, 'rotateY(180deg) translateZ(' + d / 2 + 'px)'],
      ['right',  d, h, 'rotateY(90deg) translateZ(' + w / 2 + 'px)'],
      ['left',   d, h, 'rotateY(-90deg) translateZ(' + w / 2 + 'px)'],
      ['top',    w, d, 'rotateX(90deg) translateZ(' + h / 2 + 'px)'],
      ['bottom', w, d, 'rotateX(-90deg) translateZ(' + h / 2 + 'px)']
    ];

    faces.forEach(function (f) {
      var e = document.createElement('div');
      e.className = 'f ' + (c[f[0]] || c.all || '');
      e.style.width = f[1] + 'px';
      e.style.height = f[2] + 'px';
      e.style.margin = (-f[2] / 2) + 'px 0 0 ' + (-f[1] / 2) + 'px'; // centers the face
      e.style.transform = f[3];
      if (inner[f[0]]) e.innerHTML = inner[f[0]];
      g.appendChild(e);
    });

    model.appendChild(g);
  }

  /* ---------- HELPER 2: disc ----------
     A flat circle facing front. dia = diameter. */
  function disc(dia, x, y, z, cls, extra) {
    var e = document.createElement('div');
    e.className = 'd ' + cls;
    e.style.cssText =
      'width:' + dia + 'px;height:' + dia + 'px;margin:' + (-dia / 2) + 'px 0 0 ' + (-dia / 2) + 'px;' +
      'transform:translate3d(' + x + 'px,' + y + 'px,' + z + 'px) ' + (extra || '');
    model.appendChild(e);
    return e;
  }

  /* ---------- HELPER 3: rect ----------
     A flat rectangle facing front, optionally rotated (rot, in degrees)
     and with rounded corners (rad). */
  function rect(w, h, x, y, z, cls, rot, rad) {
    var e = document.createElement('div');
    e.className = 'r ' + cls;
    e.style.cssText =
      'width:' + w + 'px;height:' + h + 'px;margin:' + (-h / 2) + 'px 0 0 ' + (-w / 2) + 'px;' +
      'border-radius:' + (rad || 0) + 'px;' +
      'transform:translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotate(' + (rot || 0) + 'deg)';
    model.appendChild(e);
    return e;
  }

  /* ---------- HELPER 4: cyl (cylinder) ----------
     A standing cylinder (like a dial), made of thin discs stacked up.
     The top disc gets topCls (and optional HTML, e.g. a tick mark). */
  function cyl(dia, hgt, x, y, z, cls, topCls, topHtml) {
    var n = Math.max(2, Math.round(hgt / 2)); // number of slices
    for (var i = n; i >= 0; i--) {
      var yy = y - hgt / 2 + hgt * i / n;
      var e = document.createElement('div');
      var isTop = (i === 0);
      e.className = 'd ' + (isTop ? topCls : cls);
      e.style.cssText =
        'width:' + dia + 'px;height:' + dia + 'px;margin:' + (-dia / 2) + 'px 0 0 ' + (-dia / 2) + 'px;' +
        'transform:translate3d(' + x + 'px,' + yy + 'px,' + z + 'px) rotateX(90deg)';
      if (isTop && topHtml) e.innerHTML = topHtml;
      model.appendChild(e);
    }
  }

  /* ==========================================================
     ASSEMBLING THE CAMERA
     ========================================================== */

  var MX = 8, MY = 6;   // center of the lens mount
  var FZ = 55;          // z of the front face of the body

  /* ----- 1. Main body -----
     HTML snippets drawn ON the front and back faces */
  var frontHtml =
    '<div style="position:absolute;left:236px;top:16px;font-size:11px;letter-spacing:.22em;color:#c9c9c9;font-weight:500">R6 II</div>' +
    '<div style="position:absolute;left:262px;top:60px;width:9px;height:9px;border-radius:50%;background:radial-gradient(circle,#5a2a10,#1a0a04);border:1px solid #444"></div>' +
    '<div style="position:absolute;left:252px;top:136px;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3c3c3c,#0c0c0c);border:1px solid #555"></div>';

  var backHtml =
    // the screen
    '<div style="position:absolute;left:16px;top:22px;width:186px;height:124px;border-radius:7px;background:linear-gradient(135deg,#1c2b40 0%,#0a0e15 62%);border:2px solid #050505;box-shadow:inset 0 0 22px rgba(110,160,255,.28),0 0 0 1px #3a3a3a;overflow:hidden">' +
      '<div style="position:absolute;left:50%;top:50%;width:46px;height:34px;margin:-17px 0 0 -23px;border:1px solid rgba(255,255,255,.55);border-radius:3px"></div>' +
      '<div style="position:absolute;left:10px;top:9px;display:flex;align-items:center;gap:5px;font-size:9px;letter-spacing:.12em;color:#e8e8e8"><i style="width:7px;height:7px;border-radius:50%;background:#ff3b30;display:block"></i>REC 4K 60</div>' +
      '<div style="position:absolute;right:10px;bottom:8px;font-size:9px;letter-spacing:.1em;color:#9fb4d6">00:00:00</div>' +
      '<div style="position:absolute;left:-30%;top:-60%;width:60%;height:220%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);transform:rotate(22deg)"></div>' +
    '</div>' +
    // joystick, dial and buttons on the right side
    '<div style="position:absolute;left:236px;top:26px;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3d3d40,#101012);border:1px solid #555"></div>' +
    '<div style="position:absolute;left:224px;top:78px;width:62px;height:62px;border-radius:50%;background:repeating-conic-gradient(#2c2c2f 0 8deg,#111 8deg 16deg);border:1px solid #555"></div>' +
    '<div style="position:absolute;left:241px;top:95px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3a3a3d,#121214);border:1px solid #5a5a5a"></div>' +
    '<div style="position:absolute;left:284px;top:30px;width:14px;height:14px;border-radius:50%;background:#1a1a1a;border:1px solid #555"></div>' +
    '<div style="position:absolute;left:222px;top:156px;width:12px;height:12px;border-radius:50%;background:#1a1a1a;border:1px solid #555"></div>' +
    '<div style="position:absolute;left:246px;top:156px;width:12px;height:12px;border-radius:50%;background:#1a1a1a;border:1px solid #555"></div>' +
    '<div style="position:absolute;left:270px;top:156px;width:12px;height:12px;border-radius:50%;background:#1a1a1a;border:1px solid #555"></div>';

  //   w    h    d   x  y  z
  box(320, 190, 110, 0, 0, 0,
    { front: 'rubber', back: 'rubber', left: 'side', right: 'side', top: 'topf', bottom: 'bot' },
    { front: frontHtml, back: backHtml });

  /* ----- 2. Hand grip (left side when you look at the front) ----- */
  box(84, 190, 52, -118, 0, 81,
    { front: 'grip', back: 'rubber', left: 'side', right: 'side', top: 'topf', bottom: 'bot' });

  // small self-timer lamp on the grip
  var lamp = disc(8, -136, -78, 107.6, '', ' ');
  lamp.style.background = 'radial-gradient(circle,#6a1e12,#1a0806)';
  lamp.style.border = '1px solid #444';

  /* ----- 3. Viewfinder hump on top ----- */
  var eyecup =
    '<div style="position:absolute;left:16px;top:5px;width:72px;height:28px;border-radius:9px;background:#070707;border:1px solid #3a3a3a"></div>' +
    '<div style="position:absolute;left:28px;top:10px;width:48px;height:18px;border-radius:5px;background:linear-gradient(135deg,#223049,#05070b);box-shadow:inset 0 0 8px rgba(120,160,255,.35)"></div>';
  var shoeTop =
    '<div style="position:absolute;left:12px;top:8px;width:22px;height:18px;border-radius:2px;background:#050505;border:1px solid #777"></div>';

  box(104, 38, 86, MX, -114, -17,
    { front: 'side', back: 'rubber', left: 'side', right: 'side', top: 'topf', bottom: 'bot' },
    { back: eyecup });

  // hot shoe (the metal plate on top of the hump)
  box(46, 4, 36, MX, -135, -14, { all: 'silver', top: 'silver' }, { top: shoeTop });

  /* ----- 4. Dials and shutter button on top ----- */
  cyl(56, 14, 112, -102, -20, 'knurl', 'dialtop', '<div class="tick"></div>');   // mode dial
  cyl(40, 6, 112, -97.5, -20, 'dialtop', 'dialtop');
  cyl(34, 8, -104, -99, 24, 'knurl', 'dialtop', '<div class="tick" style="top:4px;height:7px"></div>'); // command dial
  cyl(36, 4, -118, -97, 88, 'silver', 'silver');                                  // ring around shutter
  cyl(24, 10, -118, -100, 88, 'shtop', 'shtop');                                  // shutter button

  /* ----- 5. Strap lugs (left and right) ----- */
  box(10, 16, 26, -165, -72, -12, { all: 'silver' });
  box(10, 16, 26,  165, -72, -12, { all: 'silver' });

  /* ----- 6. Empty lens mount (no lens!) ----- */
  // silver ring, a few discs stacked so it has thickness
  for (var z = FZ + 0.6; z <= FZ + 3.6; z += 1) disc(142, MX, MY, z, 'silver');

  // dark opening
  var hole = disc(122, MX, MY, FZ + 4, '', ' ');
  hole.style.cssText += 'background:radial-gradient(circle,#030304 60%,#111 100%);border:2px solid #9a9da3';
  var hole2 = disc(110, MX, MY, FZ + 4.4, '', ' ');
  hole2.style.cssText += 'background:#020203';

  // the sensor, with a purple/blue coating shimmer
  var sensor = rect(76, 50, MX, MY, FZ + 5, '', 0, 3);
  sensor.style.cssText += 'background:linear-gradient(115deg,#1d1633,#3a2a6b 30%,#1a4a63 55%,#2b1a4f 80%);box-shadow:0 0 14px rgba(130,110,255,.35);border:1px solid #6c6c88';

  // 3 bayonet tabs inside the mount, placed around a circle (angles in degrees)
  [28, 148, 268].forEach(function (a) {
    var r = 50, rad = a * Math.PI / 180;
    rect(16, 10, MX + Math.cos(rad) * r, MY + Math.sin(rad) * r, FZ + 4.8, 'silver', a + 90, 2);
  });

  // red alignment dot
  var dot = disc(7, MX - 50, MY - 50, FZ + 4.7, '');
  dot.style.cssText += 'background:#d6342a;border:1px solid #fff4';
})();
