/* Pond interaction and ASCII water model adapted from the reference at daoho.dev.
   The selected manta artwork replaces the koi renderer. No reference analytics included. */
(() => {
'use strict';
      let S = 2 * Math.PI,
        A = (e, t, i) => (e < t ? t : e > i ? i : e),
        T = (e, t) => e + Math.random() * (t - e);
      function E(e, t, i) {
        let r = A((i - e) / (t - e), 0, 1);
        return r * r * (3 - 2 * r);
      }
      function N(e, t) {
        let i = (t - e) % S;
        return (i > Math.PI && (i -= S), i < -Math.PI && (i += S), i);
      }
      function L(e, t, i) {
        let r =
          Math.imul(0 | e, 374761393) ^
          Math.imul(0 | t, 668265263) ^
          Math.imul(0 | i, 1442695041);
        return (
          (r = Math.imul(r ^ (r >>> 13), 1274126177)),
          ((r ^= r >>> 16) >>> 0) / 4294967296
        );
      }
      const rayStyles = [
        {curiosity:1.08,nerve:1.15,cruise:1.05,tempo:1.04,social:1.1,span:1.01,spots:4},
        {curiosity:.54,nerve:.80,cruise:.94,tempo:.90,social:.85,span:.97,spots:7},
        {curiosity:.82,nerve:1.02,cruise:.90,tempo:.86,social:1.05,span:1.03,spots:2},
        {curiosity:.96,nerve:.95,cruise:1.10,tempo:1.12,social:.90,span:.99,spots:5},
        {curiosity:.68,nerve:.88,cruise:1.00,tempo:.98,social:1.16,span:1.02,spots:6},
        {curiosity:.88,nerve:1.20,cruise:.98,tempo:1.03,social:.94,span:.98,spots:3},
      ];
      const F = { x: 0, y: 0 };
      class R {
        resize(e, t) {
          let i = 0 === this.width;
          ((this.width = e), (this.height = t), i && this.seed());
        }
        seed() {
          let { width: e, height: t } = this,
            i = A(0.5 * Math.min(e, t), 170, 420),
            r = A(Math.round((e * t) / 24e4), 3, 6),
            s = e >= 1024 ? 2 : 0;
          this.rays = [];
          for (let a = 0; a < r + s; a++) {
            let s = a >= r,
              n = i * (s ? T(0.32, 0.45) : T(0.6, 1)),
              o = s ? 0.72 : 1,
              l = T(0, S),
              h = T(0.1 * e, 0.9 * e),
              c = T(0.1 * t, 0.9 * t),
              d = new Float32Array(40),
              p = n / 19;
            for (let e = 0; e < 20; e++)
              ((d[2 * e] = h - Math.cos(l) * p * e),
                (d[2 * e + 1] = c - Math.sin(l) * p * e));
            const style=rayStyles[a%rayStyles.length];
            this.rays.push({
              id: a + 1,
              style,
              spots:Array.from({length:style.spots},(_,j)=>({u:.5+(L(a,j,61)-.5)*.48,v:.23+L(a,j,83)*.39,r:.015+L(a,j,97)*.015})),
              orbit:a%2?1:-1,
              attention:0,
              length: n,
              nodes: d,
              heading: l,
              speed: 20,
              phase: T(0, S),
              turn: 0,
              wander: 0,
              curiosity: style.curiosity*T(.92,1.08),
              depth: T(0.5, o),
              depthTarget: T(0.5, o),
              depthMax: o,
              nextDive: T(6, 18),
              nextSurface: T(3, 14),
              nextWake: T(0, 2),
              beat: 0,
              rush: 0,
              food: null,
              burstUntil: 0,
              nextBurst: T(0, 3),
              finPhase: T(0, S),
              startle: 0,
              fleeX: 0,
              fleeY: 0,
              gulp: 0,
            });
          }
        }
        feed(e, t) {
          ((this.lastFeed = this.time),
            this.ripples.push({ x: e, y: t, born: this.time, strength: 0.35 }));
          let i = Math.min(
            5 + Math.floor(3 * Math.random()),
            24 - this.pellets.length,
          );
          for (let r = 0; r < i; r++) {
            let i = T(0, S),
              r = 34 * Math.sqrt(Math.random()),
              s = T(2, 6);
            this.pellets.push({
              x: e + Math.cos(i) * r * 1.3,
              y: t + Math.sin(i) * r,
              born: this.time,
              landAt: T(0.15, 0.45),
              landed: !1,
              vx: Math.cos(i) * s,
              vy: Math.sin(i) * s,
            });
          }
        }
        step(e) {
          for (let t of ((this.time += e),
          (this.pointer.speed *= Math.exp(-(8 * e))),
          this.rays))
            { this.stepRay(t, e); stepSkin(t, e); }
          let t = this.time;
          for (let i of ((this.pellets = this.pellets.filter(
            (e) => t - e.born < 14,
          )),
          this.pellets)) {
            if (!i.landed) {
              if (t - i.born < i.landAt) continue;
              for (let e of ((i.landed = !0),
              this.ripples.push({ x: i.x, y: i.y, born: t, strength: 0.1 }),
              this.rays))
                650 > Math.hypot(e.nodes[0] - i.x, e.nodes[1] - i.y) &&
                  (e.rush = 1);
              continue;
            }
            let r = Math.exp(-(0.2 * e));
            ((i.vx *= r), (i.vy *= r), (i.x += i.vx * e), (i.y += i.vy * e));
          }
          ((this.ripples = this.ripples.filter((e) => t - e.born < I(e))),
            (this.bites = this.bites.filter((e) => t - e.born < 0.45)));
        }
        stepRay(e, t) {
          let { width: i, height: r, pointer: s, time: a } = this,
            n = e.length,
            o = e.nodes,
            l = o[0],
            h = o[1],
            c = Math.cos(e.heading),
            d = Math.sin(e.heading);
          ((e.wander = A(
            e.wander + (Math.random() - 0.5) * t * 2.4,
            -0.9,
            0.9,
          )),
            (c += 0.6 * Math.cos(e.heading + e.wander)),
            (d += 0.6 * Math.sin(e.heading + e.wander)));
          let p = this.pickFood(
              e,
              l,
              h,
              Math.max(1.6 * n + 220, e.rush > 0 ? 650 : 0),
            ),
            u = Math.hypot(s.x - l, s.y - h),
            f = a - this.lastFeed < 2;
          const interest=s.active&&s.speed<600&&u<260?1-u/260:0;
          e.attention+=(interest-e.attention)*Math.min(1,t*2.2);
          (!p &&
            !f &&
            s.active &&
            s.speed > 1100 * e.style.nerve &&
            u < 0.9 * n &&
            ((e.startle = 1), (e.fleeX = s.x), (e.fleeY = s.y)),
            (e.startle = Math.max(0, e.startle - (0.5+0.16*e.style.nerve) * t)));
          let g = e.startle > 0.3 && !p,
            m = !1,
            x = !1,
            y = 0;
          if (g) {
            let t = l - e.fleeX,
              i = h - e.fleeY,
              r = Math.hypot(t, i) || 1;
            ((c += (t / r) * 4 * e.startle), (d += (i / r) * 4 * e.startle));
          } else if (p) {
            let e = p.x - l,
              t = p.y - h,
              i = Math.hypot(e, t) || 1;
            ((c += (e / i) * 3),
              (d += (t / i) * 3),
              (m = !0),
              (y = A(1 - i / (1.2 * n), 0, 1)));
          } else if (s.active) {
            let t = s.x - l,
              i = s.y - h,
              r = Math.hypot(t, i) || 1;
            const range=240+e.curiosity*100;
            if (r < range) {
              let s = e.curiosity * (1 - r / range) * (2.2+.5*e.attention),
                a = A(r / (0.6 * n), 0, 1);
              ((c += ((t / r) * a - e.orbit*(i / r) * (1 - a)) * s),
                (d += ((i / r) * a + e.orbit*(t / r) * (1 - a)) * s),
                (x = !0));
            }
          }
          for (let t of this.rays) {
            if (t === e) continue;
            let i = t.nodes[0],
              r = t.nodes[1];
            if (!(Math.abs(i - l) > 2 * n || Math.abs(r - h) > 2 * n)) {
              for (let e = 0; e < 20; e += 3) {
                let i = l - t.nodes[2 * e],
                  r = h - t.nodes[2 * e + 1],
                  s = Math.hypot(i, r),
                  a = (n + t.length) * (p ? 0.12 : 0.28);
                if (s < a && s > 0.001) {
                  let e = (1 - s / a) * 2.4;
                  ((c += (i / s) * e), (d += (r / s) * e));
                }
              }
              !m &&
                Math.hypot(i - l, r - h) < 1.6 * n &&
                ((c += 0.18 * e.style.social * Math.cos(t.heading)),
                (d += 0.18 * e.style.social * Math.sin(t.heading)));
            }
          }
          (!(function (e, t, i, r, s) {
            for (let a of ((s.x = 0), (s.y = 0), e)) {
              let e = t - A(t, a.left, a.right),
                n = i - A(i, a.top, a.bottom),
                o = Math.hypot(e, n);
              if (o > r) continue;
              if (o < 0.001) {
                let r = [a.left - t, t - a.right, a.top - i, i - a.bottom],
                  s = r.indexOf(Math.max(...r));
                ((e = 0 === s ? -1 : 1 === s ? 1 : 0),
                  (n = 2 === s ? -1 : 3 === s ? 1 : 0),
                  (o = 0));
              }
              let l = Math.hypot(e, n) || 1;
              ((s.x += (e / l) * (1 - o / r)), (s.y += (n / l) * (1 - o / r)));
            }
          })(this.avoid, l, h, 0.4 * n, F),
            (c += F.x * (m || x ? 0.5 : 1.8)),
            (d += F.y * (m || x ? 0.5 : 1.8)));
          let M = Math.max(-l, l - i, -h, h - r);
          if (M > -(0.25 * n)) {
            let e = 3.5 * A((M + 0.25 * n) / (0.5 * n), 0, 1),
              t = i / 2 - l,
              s = r / 2 - h,
              a = Math.hypot(t, s) || 1;
            ((c += (t / a) * e), (d += (s / a) * e));
          }
          let v = Math.atan2(d, c),
            w =
              (1 + 0.25 * e.rush) *
              Math.min(g ? 3 : m ? 1.9 + y : x ? 1.2 : 0.7, (e.speed / n) * 4) *
              t,
            b = A(N(e.heading, v), -w, w);
          ((e.heading += b),
            (e.turn += (b / t - e.turn) * Math.min(1, 3 * t)),
            a > e.nextBurst &&
              a > e.burstUntil &&
              ((e.burstUntil = a + T(0.7, 1.6)),
              (e.nextBurst = e.burstUntil + T(1.2, 4))));
          let k = g || m || a < e.burstUntil;
          ((e.beat += ((k ? 1 : 0) - e.beat) * Math.min(1, 3 * t)),
            e.beat > 0.6 &&
              e.depth > 0.65 &&
              a > e.nextWake &&
              (this.ripples.push({
                x: (e.skin||o)[34],
                y: (e.skin||o)[35],
                born: a,
                strength: 0.25 + 0.2 * e.depth,
              }),
              (e.nextWake = a + T(0.8, 1.6) / e.beat)),
            (e.rush = Math.max(0, e.rush - 0.7 * t)));
          let j = (12 + 0.05 * n) * e.style.cruise,
            S =
              (1 + 0.8 * e.rush) *
              (x&&!m ? .72+.28*A(u/n,0,1) : 1) *
              (g
                ? 3.2 * j
                : m
                  ? j * (1.9 + y)
                  : k
                    ? j * (x ? 1.6 : 1.35)
                    : 0.45 * j);
          ((e.speed +=
            (S - e.speed) * Math.min(1, t * (k ? 1.05 + 1.4 * e.rush : 0.45))),
            (e.phase += t * (0.6 + e.beat * (2.2 + e.speed / 11))),
            (e.finPhase += (1.3 + 1.1 * e.beat + Math.min(1, e.speed / n)) * e.style.tempo * (1+.1*e.attention) * t),
            (e.gulp += ((m && y > 0.55 ? 1 : 0) - e.gulp) * Math.min(1, 6 * t)),
            a > e.nextDive &&
              ((e.depthTarget = T(0.5, e.depthMax)),
              (e.nextDive = a + T(8, 20))),
            (e.depth +=
              ((m ? 1 : Math.min(e.depthMax,e.depthTarget+.18*e.attention)) - e.depth) *
              Math.min(1, t * (m ? 0.8 : 0.15))),
            (o[0] += Math.cos(e.heading) * e.speed * t),
            (o[1] += Math.sin(e.heading) * e.speed * t));
          let E = n / 19,
            L = e.heading + Math.PI;
          for (let e = 1; e < 20; e++) {
            let t = o[(e - 1) * 2],
              i = o[(e - 1) * 2 + 1],
              r = Math.atan2(o[2 * e + 1] - i, o[2 * e] - t);
            ((r = L + A(N(L, r), -0.16, 0.16)),
              (o[2 * e] = t + Math.cos(r) * E),
              (o[2 * e + 1] = i + Math.sin(r) * E),
              (L = r));
          }
          let C = 0.08 * n + 6,
            P = this.pellets.length;
          ((this.pellets = this.pellets.filter(
            (e) => !e.landed || (e.x - o[0]) ** 2 + (e.y - o[1]) ** 2 > C * C,
          )),
            this.pellets.length < P
              ? (this.ripples.push({
                  x: o[0],
                  y: o[1],
                  born: a,
                  strength: 0.6,
                }),
                this.bites.push({ x: o[0], y: o[1], born: a }),
                (e.nextSurface = a + T(6, 16)))
              : a > e.nextSurface &&
                (this.ripples.push({
                  x: o[0],
                  y: o[1],
                  born: a,
                  strength: 0.3,
                }),
                (e.nextSurface = a + T(8, 20))));
        }
        pickFood(e, t, i, r) {
          e.food && !this.pellets.includes(e.food) && (e.food = null);
          let s = this.nearestPellet(t, i, r);
          if (!e.food) return (e.food = s);
          let a = Math.hypot(e.food.x - t, e.food.y - i);
          return (
            a > 1.3 * r
              ? (e.food = s)
              : s && Math.hypot(s.x - t, s.y - i) < 0.5 * a && (e.food = s),
            e.food
          );
        }
        nearestPellet(e, t, i) {
          let r = null,
            s = i * i;
          for (let i of this.pellets) {
            if (!i.landed) continue;
            let a = (i.x - e) ** 2 + (i.y - t) ** 2;
            a < s && ((s = a), (r = i));
          }
          return r;
        }
        constructor() {
          ((this.width = 0),
            (this.height = 0),
            (this.time = 0),
            (this.rays = []),
            (this.pellets = []),
            (this.bites = []),
            (this.lastFeed = -1 / 0),
            (this.ripples = []),
            (this.pointer = { x: 0, y: 0, speed: 0, active: !1 }),
            (this.avoid = []));
        }
      }
      function I(e) {
        return 2.2 + 1.6 * e.strength;
      }
      function stepSkin(ray,dt) {
        // Fixed-length links follow their immediate neighbor. Angular springs
        // carry a turn rearward instead of rotating the entire body at once.
        const nodes=ray.nodes,spacing=ray.length/19;
        if(!ray.skin){
          ray.skin=new Float32Array(nodes);
          ray.jointAngles=new Float32Array(19);ray.jointVelocity=new Float32Array(19);
          for(let i=1;i<20;i++)ray.jointAngles[i-1]=Math.atan2(nodes[i*2+1]-nodes[(i-1)*2+1],nodes[i*2]-nodes[(i-1)*2]);
        }
        const skin=ray.skin,angles=ray.jointAngles,velocity=ray.jointVelocity;
        skin[0]=nodes[0];skin[1]=nodes[1];
        let parentAngle=ray.heading+Math.PI;
        for(let i=1;i<20;i++){
          const r=i/19,j=i-1,px=skin[j*2],py=skin[j*2+1];
          const passive=Math.atan2(skin[i*2+1]-py,skin[i*2]-px);
          const bend=.16+.08*r;
          const wave=Math.sin(ray.phase-5.2*r)*(.002+.014*r*r)*(.3+.7*ray.beat);
          const target=parentAngle+A(N(parentAngle,passive),-bend,bend)+wave;
          const stiffness=55-25*r,damping=12-3*r;
          velocity[j]+=(N(angles[j],target)*stiffness-velocity[j]*damping)*dt;
          velocity[j]=A(velocity[j],-1.8,1.8);
          angles[j]+=velocity[j]*dt;
          angles[j]=parentAngle+A(N(parentAngle,angles[j]),-bend,bend);
          skin[i*2]=px+Math.cos(angles[j])*spacing;
          skin[i*2+1]=py+Math.sin(angles[j])*spacing;
          parentAngle=angles[j];
        }
      }
      function B(e) {
        return e < 0.12
          ? 0.11 * Math.pow(Math.sin(((e / 0.12) * Math.PI) / 2), 0.55)
          : e < 0.3
            ? 0.11 + 0.025 * E(0.12, 0.3, e)
            : 0.033 + 0.102 * (1 - E(0.3, 0.74, e));
      }
      function z(e, t, i, r, s, a, n) {
        let o = 0.85 * B(i),
          l = Math.cos(r),
          h = Math.sin(r),
          c = e - i,
          d = t - o;
        return (
          !(((c * l + d * h - s) / s) ** 2 + ((-c * h + d * l) / a) ** 2 > 1) &&
          ((n.flag = 2), (n.du = c), (n.da = d), !0)
        );
      }
      let D = {
          bg: [26, 25, 33],
          white: [236, 228, 218],
          red: [232, 96, 56],
          black: [92, 90, 108],
          fin: [214, 206, 198],
          eye: [20, 20, 26],
          water: [255, 247, 240],
          shadow: [0, 0, 0],
          shadowAlpha: 0.55,
          pellet: [236, 170, 92],
          alpha: 0.8,
          depthFloor: 0.4,
          tile: [0.68, 0.98],
          hi: [
            [112, 22, 24],
            [168, 34, 28],
            [214, 58, 30],
            [240, 96, 34],
            [250, 138, 52],
            [255, 178, 96],
          ],
          ink: 0.42,
        },
        _ = {
          bg: [245, 244, 241],
          white: [112, 108, 104],
          red: [204, 62, 28],
          black: [36, 33, 40],
          fin: [138, 132, 126],
          eye: [24, 22, 26],
          water: [38, 37, 35],
          shadow: [60, 58, 56],
          shadowAlpha: 0.2,
          pellet: [176, 108, 40],
          alpha: 0.9,
          depthFloor: 0.55,
          tile: [0.78, 0.55],
          hi: [
            [138, 24, 22],
            [184, 38, 24],
            [222, 62, 28],
            [238, 100, 38],
            [244, 140, 66],
            [248, 176, 116],
          ],
          ink: 0.45,
        },
        G = "t%SX8@#",
        O = [0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.75, 0.75];
      function U(e, t) {
        let i = Math.hypot(e, t) || 1;
        return Math.abs(t) < 0.38 * i
          ? "-"
          : Math.abs(e) < 0.38 * i
            ? "|"
            : e * t > 0
              ? "\\"
              : "/";
      }
      function W(e, t, i) {
        let r = Math.floor(e),
          s = Math.floor(t),
          a = E(0, 1, e - r),
          n = E(0, 1, t - s),
          o = L(r, s, i),
          l = L(r + 1, s, i),
          h = L(r, s + 1, i);
        return (
          o +
          (l - o) * a +
          (h - o) * n +
          (o - l - h + L(r + 1, s + 1, i)) * a * n
        );
      }
      function q(e, t, i, r) {
        return ((t - e.s) / e.rs) ** 2 + ((i - e.v) / e.rv) ** 2 < 1 + r;
      }
      let X = (e) => (e[0] << 16) | (e[1] << 8) | e[2],
        Z = (e, t, i) => [
          (e[0] + (t[0] - e[0]) * i) | 0,
          (e[1] + (t[1] - e[1]) * i) | 0,
          (e[2] + (t[2] - e[2]) * i) | 0,
        ],
        K = (e, t) => [
          0 | Math.min(255, e[0] * t),
          0 | Math.min(255, e[1] * t),
          0 | Math.min(255, e[2] * t),
        ];
      class V {
        setTheme(e) {
          this.palette = e ? _ : D;
        }
        resize(e, t, i) {
          ((this.dpr = i),
            (this.cw = A(Math.round(e / 125), 8, 12)),
            (this.ch = this.cw + 2),
            (this.cols = Math.ceil(e / this.cw)),
            (this.rows = Math.ceil(t / this.ch)),
            (this.ctx.canvas.width = Math.round(e * i)),
            (this.ctx.canvas.height = Math.round(t * i)));
          let r = this.cols * this.rows;
          ((this.energy = new Float32Array(r)),
            (this.energyTmp = new Float32Array(r)),
            (this.cellGlyph = new Uint16Array(r)),
            (this.cellColor = new Uint32Array(r)),
            (this.cellAlpha = new Float32Array(r)),
            (this.cellTile = new Uint32Array(r)),
            (this.cellTileAlpha = new Float32Array(r)),
            (this.cellDim = new Float32Array(r).fill(1)),
            (this.cellShadow = new Uint8Array(r)));
        }
        setDimBoxes(e) {
          let { cols: t, rows: i, cw: r, ch: s, cellDim: a } = this;
          a.fill(1);
          let n = 4 * r;
          for (let o of e) {
            let e = Math.max(0, Math.floor((o.left - n) / r)),
              l = Math.min(t - 1, Math.floor((o.right + n) / r)),
              h = Math.max(0, Math.floor((o.top - n) / s)),
              c = Math.min(i - 1, Math.floor((o.bottom + n) / s));
            for (let i = h; i <= c; i++)
              for (let h = e; h <= l; h++) {
                let e = h * r + r / 2,
                  l = i * s + s / 2,
                  c = Math.hypot(
                    Math.max(o.left - e, 0, e - o.right),
                    Math.max(o.top - l, 0, l - o.bottom),
                  ),
                  d = i * t + h;
                a[d] = Math.min(a[d], 0.15 + 0.85 * E(0, n, c));
              }
          }
        }
        render(e, t) {
          let { ctx: i, dpr: r, cols: s } = this;
          if (0 !== s) {
            for (let t of (this.cellGlyph.fill(0),
            this.cellTileAlpha.fill(0),
            this.cellShadow.fill(0),
            [...e.rays].sort((e, t) => e.depth - t.depth)))
              this.rasterizeRay(t, e.time);
            (this.depositWake(e),
              this.diffuse(t),
              i.setTransform(1, 0, 0, 1, 0, 0),
              i.clearRect(0, 0, i.canvas.width, i.canvas.height),
              i.setTransform(r, 0, 0, r, 0, 0),
              (i.font = "600 "
                .concat(Math.round(0.72 * this.ch), "px ")
                .concat(this.fontFamily)),
              (i.textAlign = "center"),
              (i.textBaseline = "middle"),
              this.drawEnvironment(e),
              this.drawShadows(),
              this.drawWake(),
              this.drawRipples(e),
              this.drawPellets(e),
              this.drawCells(),
              this.drawBites(e),
              (i.globalAlpha = 1));
          }
        }
        style(e) {
          let t = this.styles.get(e);
          return (
            t ||
              ((t = "rgb("
                .concat(e >>> 16, ",")
                .concat((e >>> 8) & 255, ",")
                .concat(255 & e, ")")),
              this.styles.set(e, t)),
            t
          );
        }
        glyphAt(e, t, i, r) {
          let { ctx: s, cw: a, ch: n, cols: o } = this;
          ((s.globalAlpha = r),
            (s.fillStyle = this.style(X(i))),
            s.fillText(t, (e % o) * a + a / 2, ((e / o) | 0) * n + n / 2));
        }
        cellIndex(e, t) {
          let i = Math.floor(e / this.cw),
            r = Math.floor(t / this.ch);
          return i < 0 || r < 0 || i >= this.cols || r >= this.rows
            ? -1
            : r * this.cols + i;
        }
        drawCells() {
          let {
            ctx: e,
            cw: t,
            ch: i,
            cols: r,
            cellGlyph: s,
            cellColor: a,
            cellAlpha: n,
            cellTile: o,
            cellTileAlpha: l,
            cellDim: h,
          } = this;
          for (let c = 0; c < s.length; c++) {
            let d = s[c];
            if (!d) continue;
            let p = (c % r) * t,
              u = ((c / r) | 0) * i;
            (l[c] > 0 &&
              ((e.globalAlpha = l[c] * h[c]),
              (e.fillStyle = this.style(o[c])),
              e.fillRect(p + 1, u + 1, t - 1, i - 1)),
              32 !== d &&
                ((e.globalAlpha = n[c] * h[c]),
                (e.fillStyle = this.style(a[c])),
                e.fillText(String.fromCharCode(d), p + t / 2, u + i / 2 + 1)));
          }
        }
        depositWake(e) {
          let { energy: t } = this;
          for (let i of e.rays)
            for (let e = 16; e < 20; e++) {
              const chain=i.skin||i.nodes;
              let r = this.cellIndex(chain[2 * e], chain[2 * e + 1]);
              r >= 0 && (t[r] = Math.min(1.5, t[r] + 0.035 + 0.0012 * i.speed));
            }
          if (e.pointer.active) {
            let i = this.cellIndex(e.pointer.x, e.pointer.y);
            i >= 0 && (t[i] = Math.min(1.5, t[i] + 0.12));
          }
        }
        diffuse(e) {
          let { cols: t, rows: i, energy: r, energyTmp: s } = this,
            a = Math.exp(-(1.1 * e));
          for (let e = 0; e < i; e++)
            for (let n = 0; n < t; n++) {
              let o = e * t + n,
                l = n > 0 ? r[o - 1] : r[o],
                h = n < t - 1 ? r[o + 1] : r[o],
                c = e > 0 ? r[o - t] : r[o],
                d = e < i - 1 ? r[o + t] : r[o];
              s[o] = (4 * r[o] + l + h + c + d) * 0.125 * a;
            }
          ((this.energy = s), (this.energyTmp = r));
        }
        drawShadows() {
          let { cellShadow: e, cellGlyph: t, cellDim: i, palette: r } = this;
          for (let s = 0; s < e.length; s++)
            e[s] &&
              !t[s] &&
              this.glyphAt(s, ":", r.shadow, r.shadowAlpha * i[s]);
        }
        drawWake() {
          let { energy: e, cellGlyph: t, cellShadow: i, palette: r } = this;
          for (let s = 0; s < e.length; s++) {
            let a = e[s];
            a < 0.22 ||
              t[s] ||
              i[s] ||
              this.glyphAt(
                s,
                a > 0.5 ? "-" : ".",
                r.water,
                0.35 * Math.min(1, (a - 0.22) * 1.4),
              );
          }
        }
        drawRipples(e) {
          let {
            cw: t,
            ch: i,
            cols: r,
            rows: s,
            cellGlyph: a,
            palette: n,
          } = this;
          for (let o of e.ripples) {
            let l = e.time - o.born,
              h = Math.pow(1 - l / I(o), 1.5) * o.strength;
            for (let e = 0; e < 2; e++) {
              let c = 52 * Math.max(0, l - 0.45 * e) * (0.7 + 0.5 * o.strength);
              if (c < 2) continue;
              let d = 0.6 * t,
                p = Math.max(0, Math.floor((o.x - c - t) / t)),
                u = Math.min(r - 1, Math.floor((o.x + c + t) / t)),
                f = Math.max(0, Math.floor((o.y - c - i) / i)),
                g = Math.min(s - 1, Math.floor((o.y + c + i) / i)),
                m = h * (0 === e ? 0.55 : 0.3);
              for (let s = f; s <= g; s++)
                for (let l = p; l <= u; l++) {
                  let h = s * r + l;
                  if (a[h]) continue;
                  let p = l * t + t / 2 - o.x,
                    u = s * i + i / 2 - o.y;
                  if (Math.abs(Math.hypot(p, u) - c) > d) continue;
                  let f = 1 === e ? "." : U(-u, p);
                  this.glyphAt(h, f, n.water, m);
                }
            }
          }
        }
        drawBites(e) {
          let { palette: t } = this;
          for (let i of e.bites) {
            let r = this.cellIndex(i.x, i.y);
            if (r < 0) continue;
            let s = (e.time - i.born) / 0.45,
              a = s < 0.35 ? "*" : s < 0.7 ? "+" : ".";
            this.glyphAt(
              r,
              a,
              t.pellet,
              Math.min(1, 1.6 * t.alpha) * (1 - s * s),
            );
          }
        }
        drawPellets(e) {
          let { cellGlyph: t, palette: i, ch: r } = this;
          for (let s of e.pellets) {
            let a = e.time - s.born;
            if (!s.landed) {
              let e = a / s.landAt,
                n = this.cellIndex(s.x, s.y - (1 - e) * r * 1.5);
              if (n < 0 || t[n]) continue;
              this.glyphAt(
                n,
                e < 0.5 ? "'" : ".",
                i.pellet,
                i.alpha * (0.5 + 0.4 * e),
              );
              continue;
            }
            let n = this.cellIndex(s.x, s.y);
            if (n < 0 || t[n]) continue;
            let o = E(9, 14, a),
              l = 0.8 + 0.2 * Math.sin(3 * a + s.x);
            this.glyphAt(
              n,
              o > 0.55 ? "." : "o",
              i.pellet,
              i.alpha * l * (1 - 0.85 * o),
            );
          }
        }
        constructor(e) {
          ((this.dpr = 1),
            (this.cw = 8),
            (this.ch = 12),
            (this.cols = 0),
            (this.rows = 0),
            (this.palette = D),
            (this.styles = new Map()),
            (this.markingCache = new Map()),
            (this.fontFamily =
              "ui-monospace, SFMono-Regular, Menlo, monospace"),
            (this.energy = new Float32Array(0)),
            (this.energyTmp = new Float32Array(0)),
            (this.cellGlyph = new Uint16Array(0)),
            (this.cellColor = new Uint32Array(0)),
            (this.cellAlpha = new Float32Array(0)),
            (this.cellTile = new Uint32Array(0)),
            (this.cellTileAlpha = new Float32Array(0)),
            (this.cellDim = new Float32Array(0)),
            (this.cellShadow = new Uint8Array(0)),
            (this.spine = new Float32Array(40)),
            (this.arc = new Float32Array(20)),
            (this.arcTotal = 1),
            (this.flareLeft = 1),
            (this.flareRight = 1),
            (this.hit = { flag: 0, across: 1, du: 1, da: 0 }),
            (this.hitS = 0),
            (this.hitV = 0),
            (this.hitDist = 0),
            (this.hitTx = 1),
            (this.hitTy = 0),
            (this.hitSeg = 0));
          let t = e.getContext("2d");
          if (!t) throw Error("2D canvas unavailable");
          this.ctx = t;
        }
      }

  V.prototype.drawEnvironment=function(world){
    const ctx=this.ctx,width=world.width,height=world.height;
    const light=this.palette===_;
    if(!this.waterGrain||this.waterGrainLight!==light){
      const tile=document.createElement('canvas');tile.width=128;tile.height=128;
      const grain=tile.getContext('2d');
      for(let i=0;i<430;i++){
        const alpha=.035+L(i,5,109)*.035;
        grain.fillStyle=light?`rgba(66,104,94,${alpha})`:`rgba(130,157,148,${alpha})`;
        grain.fillRect(Math.floor(L(i,7,109)*128),Math.floor(L(i,11,109)*128),1,1);
      }
      this.waterGrain=ctx.createPattern(tile,'repeat');this.waterGrainLight=light;
    }
    ctx.save();ctx.globalAlpha=1;ctx.fillStyle=this.waterGrain;ctx.fillRect(0,0,width,height);
    const count=A(Math.round(width*height/29000),12,42),p=world.pointer;
    for(let i=0;i<count;i++){
      const phase=L(i,2,137)*S;
      let x=(L(i,3,137)*width+world.time*(.35+.35*L(i,4,137)))%width;
      let y=(L(i,5,137)*height+Math.sin(world.time*.07+phase)*5+height)%height;
      if(p.active){
        const dx=x-p.x,dy=y-p.y,distance=Math.hypot(dx,dy)||1;
        if(distance<110){const eddy=Math.pow(1-distance/110,2)*Math.min(11,1+p.speed*.008);x-=dy/distance*eddy;y+=dx/distance*eddy;}
      }
      const index=this.cellIndex(x,y);
      if(index<0||this.cellGlyph[index])continue;
      ctx.globalAlpha=(.10+.08*(.5+.5*Math.sin(world.time*.2+phase)))*this.cellDim[index];
      ctx.fillStyle=light?(i%3?'#52776d':'#5f778e'):(i%3?'#739f94':'#8298af');
      const size=i%7===0?1.5:1;
      ctx.fillRect(Math.round(x),Math.round(y),size,size);
      if(i%9===0){ctx.globalAlpha*=.35;ctx.fillRect(Math.round(x)+2,Math.round(y),1,1);}
    }
    ctx.restore();
  };

  // Sample the selected artwork once. The live canvas stamps its original
  // colors into the same character-cell lattice used by the reference pond.
  let spritePixels=null;
  const spriteWidth=96,spriteHeight=92;
  const sprite=new Image();
  sprite.src='/assets/manta-ray.png';
  sprite.onload=()=>{
    const sample=document.createElement('canvas');
    sample.width=spriteWidth;sample.height=spriteHeight;
    const sc=sample.getContext('2d',{willReadFrequently:true});
    sc.imageSmoothingEnabled=false;
    sc.drawImage(sprite,146,223,962,914,0,0,spriteWidth,spriteHeight);
    spritePixels=sc.getImageData(0,0,spriteWidth,spriteHeight).data;
    renderer.render(world,1/60);
  };

  V.prototype.rasterizeRay=function(ray,time){
    if(!spritePixels)return;
    const {cw,ch,cols,rows}=this;
    const n=ray.length,spine=ray.skin||ray.nodes,arc=this.arc;
    const segDX=this.segDX||(this.segDX=new Float32Array(19));
    const segDY=this.segDY||(this.segDY=new Float32Array(19));
    const segLength=this.segLength||(this.segLength=new Float32Array(19));
    const segInvLength2=this.segInvLength2||(this.segInvLength2=new Float32Array(19));
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    arc[0]=0;
    for(let i=0;i<20;i++){
      const x=spine[i*2],y=spine[i*2+1];
      minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      if(i){const j=i-1;segDX[j]=x-spine[j*2];segDY[j]=y-spine[j*2+1];segLength[j]=Math.hypot(segDX[j],segDY[j])||1;segInvLength2[j]=1/(segLength[j]*segLength[j]);arc[i]=arc[j]+segLength[j];}
    }
    const total=arc[19]||n,padding=n*.57;
    const c0=Math.max(0,Math.floor((minX-padding)/cw));
    const c1=Math.min(cols-1,Math.ceil((maxX+padding)/cw));
    const r0=Math.max(0,Math.floor((minY-padding)/ch));
    const r1=Math.min(rows-1,Math.ceil((maxY+padding)/ch));
    const opacity=this.palette.alpha*(this.palette.depthFloor+(1-this.palette.depthFloor)*ray.depth);
    for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){
      const px=col*cw+cw/2,py=row*ch+ch/2;
      let bestDistance=Infinity,along=0,across=0;
      for(let i=0;i<19;i++){
        const ax=spine[i*2],ay=spine[i*2+1];
        const dx=segDX[i],dy=segDY[i];
        const raw=((px-ax)*dx+(py-ay)*dy)*segInvLength2[i];
        const f=A(raw,0,1),ox=px-ax-dx*f,oy=py-ay-dy*f;
        const distance=ox*ox+oy*oy;
        if(distance<bestDistance){
          const len=segLength[i];
          bestDistance=distance;
          along=(arc[i]+((i===0&&raw<0)||(i===18&&raw>1)?raw:f)*len)/total;
          across=((px-ax)*dy-(py-ay)*dx)/len/n;
        }
      }
      if(along<0||along>=1||bestDistance>padding*padding)continue;
      const side=across<0?-1:1;
      const wingPhase=ray.finPhase-along*2.6+Math.abs(across)*.7+side*A(ray.turn,-.7,.7)*.45;
      const wingScale=along<.73?(.85+.15*Math.sin(wingPhase))*(1-side*A(ray.turn,-.8,.8)*.11)*ray.style.span:1;
      const cross=Math.abs(across);
      const u=.5+side*(Math.min(cross,.09)+Math.max(0,cross-.09)/wingScale)/1.06;
      const v=along-Math.sin(wingPhase-.4)*Math.pow(Math.abs(u-.5)*2,1.5)*.075;
      if(u<0||u>=1||v<0||v>=1)continue;
      const ix=Math.min(spriteWidth-1,Math.floor(u*spriteWidth));
      const iy=Math.min(spriteHeight-1,Math.floor(v*spriteHeight));
      const pixel=(iy*spriteWidth+ix)*4;
      if(spritePixels[pixel+3]<180)continue;
      let shade=1-Math.pow(Math.abs(u-.5)*2,1.5)*(.08+.08*Math.cos(wingPhase));
      shade*=1+.035*ray.attention+.025*ray.gulp;
      if(v>.2&&v<.68&&Math.abs(u-.5)<.018+(ray.id%3)*.005)shade*=.95;
      const color=[Math.min(255,spritePixels[pixel]*shade)|0,Math.min(255,spritePixels[pixel+1]*shade)|0,Math.min(255,spritePixels[pixel+2]*shade)|0];
      if(v>.2&&v<.67&&u>.2&&u<.8){
        for(const spot of ray.spots){
          const dx=(u-spot.u)/spot.r,dy=(v-spot.v)/(spot.r*.72);
          if(dx*dx+dy*dy<1){color[0]+=Math.round((210-color[0])*.3);color[1]+=Math.round((216-color[1])*.3);color[2]+=Math.round((222-color[2])*.3);break;}
        }
      }
      const index=row*cols+col;
      this.cellGlyph[index]=32;
      this.cellTile[index]=X(color);
      this.cellTileAlpha[index]=opacity;
      this.cellAlpha[index]=0;
      const sx=col+Math.round(n*.04/cw)+1,sy=row+Math.round(n*.05/ch)+1;
      if(sx<cols&&sy<rows)this.cellShadow[sy*cols+sx]=1;
    }
  };

  const canvas=document.getElementById('ocean');
  const stats=document.getElementById('pond-stats');
  const world=new R(),renderer=new V(canvas);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,raf=0,last=0,acc=0,frames=0,lastPointerTime=0;

  function measure(){
    const boxes=[...document.querySelectorAll('[data-pond-avoid],section.page:not(.home):not([hidden])')]
      .filter(el=>el.getClientRects().length&&!el.closest('[hidden]'))
      .map(el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};});
    const merged=[];
    for(const box of boxes.sort((a,b)=>a.top-b.top)){
      const near=merged.find(b=>box.top-b.bottom<160&&box.left-b.right<160&&b.left-box.right<160);
      if(near){near.left=Math.min(near.left,box.left);near.right=Math.max(near.right,box.right);near.bottom=Math.max(near.bottom,box.bottom);}
      else merged.push({...box});
    }
    world.avoid=merged;renderer.setDimBoxes(merged);
    if(paused)renderer.render(world,0);
  }
  function report(){
    stats.querySelector('.ray-count').textContent=world.rays.length;
    stats.querySelector('.food-count').textContent=world.pellets.length;
    stats.dataset.ripples=world.ripples.length;
    stats.dataset.food=world.pellets.length;
    stats.dataset.rays=world.rays.length;
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    if(rect.width<1||rect.height<1)return;
    const oldWidth=world.width,oldHeight=world.height;
    renderer.resize(rect.width,rect.height,Math.min(devicePixelRatio||1,2));
    world.resize(rect.width,rect.height);
    if(oldWidth&&((oldWidth<1024)!==(rect.width<1024)))world.seed();
    else if(oldWidth&&oldHeight){for(const ray of world.rays){for(let j=0;j<20;j++){ray.nodes[j*2]*=rect.width/oldWidth;ray.nodes[j*2+1]*=rect.height/oldHeight;}ray.skin=null;ray.jointAngles=null;ray.jointVelocity=null;}}
    measure();renderer.render(world,1/60);report();
  }
  function theme(){renderer.setTheme(document.documentElement.dataset.theme==='light');renderer.render(world,1/60);}
  function frame(now){
    if(!document.hidden){
      const dt=Math.min(.1,(now-last)/1000||1/60);
      if(!paused){acc+=dt;let steps=0;while(acc>=1/60&&steps<4){world.step(1/60);acc-=1/60;steps++;}if(steps===4)acc=0;}
      if(++frames%30===0&&!paused)measure();
      if(!paused)renderer.render(world,dt);report();
    }
    last=now;raf=requestAnimationFrame(frame);
  }
  function ignored(event){return event.composedPath().some(el=>el instanceof Element&&el.matches('a,button,input,textarea,select,label,dialog,[role="button"],[data-pond-ignore]'));}
  window.addEventListener('pointermove',event=>{
    if(paused||document.querySelector('dialog[open]'))return;
    const p=world.pointer;
    const dt=Math.max(1,event.timeStamp-lastPointerTime)/1000;
    const speed=Math.hypot(event.clientX-p.x,event.clientY-p.y)/dt;
    p.speed+=(Math.min(speed,5000)-p.speed)*.5;
    p.x=event.clientX;p.y=event.clientY;
    p.active=event.pointerType!=='touch';
    lastPointerTime=event.timeStamp;
  },{passive:true});
  const clearPointer=()=>{world.pointer.active=false;world.pointer.speed=0;};
  document.documentElement.addEventListener('pointerleave',clearPointer);
  window.addEventListener('blur',clearPointer);
  window.addEventListener('click',event=>{
    if(paused||ignored(event)||getSelection()?.toString())return;
    world.feed(event.clientX,event.clientY);report();
  });
  document.getElementById('feed-rays').addEventListener('click',()=>{
    if(paused){paused=false;motionLabel();}
    world.feed(world.width*.72,world.height*.45);report();
  });
  function motionLabel(){
    document.querySelectorAll('.motion-toggle').forEach(button=>{
      button.setAttribute('aria-pressed',String(paused));
      button.setAttribute('aria-label',`${paused?'Play':'Pause'} manta ray animation`);
      button.firstElementChild.textContent=paused?'▷':'Ⅱ';
    });
  }
  document.querySelectorAll('.motion-toggle').forEach(button=>button.addEventListener('click',()=>{paused=!paused;clearPointer();motionLabel();}));
  reduced.addEventListener('change',event=>{paused=event.matches;motionLabel();});
  document.addEventListener('visibilitychange',()=>{last=performance.now();clearPointer();});
  window.addEventListener('pond:theme',theme);
  window.addEventListener('pond:layout',()=>requestAnimationFrame(measure));
  window.addEventListener('scroll',measure,{passive:true});
  new ResizeObserver(resize).observe(canvas);
  document.fonts.ready.then(measure);
  window.addEventListener('pagehide',()=>cancelAnimationFrame(raf));
  window.addEventListener('pageshow',()=>{cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(frame);});
  resize();theme();motionLabel();raf=requestAnimationFrame(frame);
})();
