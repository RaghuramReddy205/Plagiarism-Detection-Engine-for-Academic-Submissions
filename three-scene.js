/**
 * Plagiarism Detection Engine - Neon Electromagnetic 3D Background
 * =================================================================
 * COMPLETELY NEW DESIGN - Electromagnetic Neon Cyberscape
 * 
 * Features:
 * - Hexagonal Neon Matrix floor with pulsing glow
 * - Mouse-tracked Electromagnetic Neon Orb with plasma tendrils
 * - Floating DNA-style Double Helix rotating structure
 * - Aurora Borealis flowing neon ribbons
 * - Agency data nodes as spinning icosahedrons
 * - Electromagnetic field lines connecting mouse to nodes
 * - Holographic particle nebula with depth
 * - Full parallax mouse tracking
 * - Dark/Light theme transitions
 */

class Interactive3DScene {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Three.js or container not available');
      return;
    }

    this.isDark = true;
    this.isScanning = false;
    this.scanPhase = 0;
    this.clock = new THREE.Clock();

    // Mouse tracking
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.mouseWorld = new THREE.Vector3(0, 5, 20);
    this.mouseWorldTarget = new THREE.Vector3(0, 5, 20);
    this.mouseTrails = [];

    // Scene objects
    this.agencyNodes = [];
    this.fieldLines = [];
    this.helixParts = [];
    this.auroraRibbons = [];

    this._init();
    this._createHexFloor();
    this._createMouseOrb();
    this._createDNAHelix();
    this._createAuroraRibbons();
    this._createAgencyNodes();
    this._createNebula();
    this._bindEvents();
    this._loop();
  }

  _init() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020510, 0.0035);

    this.camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 800);
    this.camera.position.set(0, 20, 100);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.container.appendChild(this.renderer.domElement);

    // World group for parallax tilt
    this.world = new THREE.Group();
    this.scene.add(this.world);

    // Lighting — rich, multi-colored neon environment
    this.ambientLight = new THREE.AmbientLight(0x0a0a1e, 1.5);
    this.scene.add(this.ambientLight);

    // Primary neon cyan top light
    this.keyLight = new THREE.DirectionalLight(0x00ffcc, 2.2);
    this.keyLight.position.set(30, 60, 40);
    this.scene.add(this.keyLight);

    // Secondary magenta accent light
    this.fillLight = new THREE.DirectionalLight(0xff00aa, 1.6);
    this.fillLight.position.set(-40, -20, -30);
    this.scene.add(this.fillLight);

    // Violet rim light from behind
    this.rimLight = new THREE.DirectionalLight(0x6600ff, 1.2);
    this.rimLight.position.set(0, 10, -60);
    this.scene.add(this.rimLight);
  }

  /* ═══════════════════════════════════════════════════
     1. HEXAGONAL NEON MATRIX FLOOR
     ═══════════════════════════════════════════════════ */
  _createHexFloor() {
    // Create a grid of hexagon outlines on the floor
    this.hexGroup = new THREE.Group();
    this.hexGroup.position.y = -20;
    this.world.add(this.hexGroup);

    const hexRadius = 5;
    const rows = 16;
    const cols = 22;
    this.hexMeshes = [];

    for (let r = -rows / 2; r < rows / 2; r++) {
      for (let c = -cols / 2; c < cols / 2; c++) {
        const xOff = c * hexRadius * 1.75;
        const zOff = r * hexRadius * 1.52 + (c % 2 === 0 ? 0 : hexRadius * 0.76);

        // Hex ring (torus with 6 segments to form hexagon)
        const hexGeo = new THREE.RingGeometry(hexRadius * 0.75, hexRadius * 0.85, 6);
        const hexMat = new THREE.MeshBasicMaterial({
          color: 0x00ffcc,
          transparent: true,
          opacity: 0.15 + Math.random() * 0.12,
          side: THREE.DoubleSide
        });
        const hex = new THREE.Mesh(hexGeo, hexMat);
        hex.rotation.x = -Math.PI / 2;
        hex.position.set(xOff, 0, zOff);
        hex.userData = { baseOpacity: hexMat.opacity, phase: Math.random() * Math.PI * 2 };
        this.hexGroup.add(hex);
        this.hexMeshes.push(hex);
      }
    }

    // Reflective dark plane underneath
    const planeGeo = new THREE.PlaneGeometry(400, 300);
    this.floorMat = new THREE.MeshStandardMaterial({
      color: 0x020510,
      roughness: 0.1,
      metalness: 0.92,
      transparent: true,
      opacity: 0.9
    });
    const floor = new THREE.Mesh(planeGeo, this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -20.2;
    this.world.add(floor);
  }

  /* ═══════════════════════════════════════════════════
     2. MOUSE ELECTROMAGNETIC NEON ORB
     ═══════════════════════════════════════════════════ */
  _createMouseOrb() {
    this.orbGroup = new THREE.Group();
    this.world.add(this.orbGroup);

    // Central glowing sphere
    const coreGeo = new THREE.SphereGeometry(2.0, 32, 32);
    this.orbCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.95
    });
    this.orbCore = new THREE.Mesh(coreGeo, this.orbCoreMat);
    this.orbGroup.add(this.orbCore);

    // Inner plasma glow sphere (larger, dimmer)
    const glowGeo = new THREE.SphereGeometry(3.8, 24, 24);
    this.orbGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.18
    });
    this.orbGlow = new THREE.Mesh(glowGeo, this.orbGlowMat);
    this.orbGroup.add(this.orbGlow);

    // Outer corona ring
    const coronaGeo = new THREE.TorusGeometry(4.5, 0.12, 16, 64);
    this.coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff00aa,
      transparent: true,
      opacity: 0.85
    });
    this.corona = new THREE.Mesh(coronaGeo, this.coronaMat);
    this.orbGroup.add(this.corona);

    // Secondary tilted ring
    const ring2Geo = new THREE.TorusGeometry(5.5, 0.08, 16, 64);
    this.ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x6600ff,
      transparent: true,
      opacity: 0.65
    });
    this.ring2 = new THREE.Mesh(ring2Geo, this.ring2Mat);
    this.ring2.rotation.x = Math.PI / 3;
    this.ring2.rotation.z = Math.PI / 6;
    this.orbGroup.add(this.ring2);

    // Third ring — horizontal orbit
    const ring3Geo = new THREE.TorusGeometry(6.2, 0.06, 16, 64);
    this.ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.5
    });
    this.ring3 = new THREE.Mesh(ring3Geo, this.ring3Mat);
    this.ring3.rotation.x = Math.PI / 2;
    this.orbGroup.add(this.ring3);

    // Dynamic neon point light attached to mouse
    this.mouseLight = new THREE.PointLight(0x00ffcc, 5, 100, 1.5);
    this.orbGroup.add(this.mouseLight);

    // Secondary warm light
    this.mouseLight2 = new THREE.PointLight(0xff00aa, 3, 70, 1.8);
    this.mouseLight2.position.set(2, -2, 3);
    this.orbGroup.add(this.mouseLight2);

    // Trailing particles
    const trailCount = 40;
    this.trailPositions = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
    this.trailMat = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 2.5,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.trailPoints = new THREE.Points(trailGeo, this.trailMat);
    this.world.add(this.trailPoints);

    for (let i = 0; i < trailCount; i++) {
      this.mouseTrails.push(new THREE.Vector3(0, 5, 20));
    }
  }

  /* ═══════════════════════════════════════════════════
     3. DNA DOUBLE HELIX STRUCTURE
     ═══════════════════════════════════════════════════ */
  _createDNAHelix() {
    this.helixGroup = new THREE.Group();
    this.helixGroup.position.set(0, 5, -15);
    this.world.add(this.helixGroup);

    const helixLength = 80;
    const steps = 120;
    const radius = 14;
    const twist = 0.08;

    const strandColors = [0x00ffcc, 0xff00aa];

    for (let strand = 0; strand < 2; strand++) {
      const offset = strand * Math.PI;
      const color = strandColors[strand];

      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * helixLength - helixLength / 2;
        const angle = i * twist + offset;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Small glowing sphere at each helix point
        const sphereGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.7
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(x, t * 0.6, z);
        this.helixGroup.add(sphere);
        this.helixParts.push(sphere);

        // Cross-links (rungs of the ladder) every 6 steps
        if (i % 6 === 0 && strand === 0) {
          const oppAngle = i * twist + Math.PI;
          const ox = Math.cos(oppAngle) * radius;
          const oz = Math.sin(oppAngle) * radius;

          const rungGeo = new THREE.CylinderGeometry(0.12, 0.12, radius * 2, 6);
          const rungMat = new THREE.MeshBasicMaterial({
            color: 0x6600ff,
            transparent: true,
            opacity: 0.35
          });
          const rung = new THREE.Mesh(rungGeo, rungMat);
          rung.position.set((x + ox) / 2, t * 0.6, (z + oz) / 2);
          rung.lookAt(new THREE.Vector3(ox, t * 0.6, oz));
          rung.rotation.z = Math.PI / 2;
          this.helixGroup.add(rung);
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     4. AURORA BOREALIS NEON RIBBONS
     ═══════════════════════════════════════════════════ */
  _createAuroraRibbons() {
    const ribbonColors = [0x00ffcc, 0xff00aa, 0x6600ff, 0x00aaff];

    for (let r = 0; r < 4; r++) {
      const points = [];
      const segments = 80;
      const yBase = 30 + r * 8;
      const xSpread = 150;

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = (t - 0.5) * xSpread;
        const y = yBase + Math.sin(t * Math.PI * 3 + r) * 6;
        const z = -40 - r * 12 + Math.sin(t * Math.PI * 2) * 8;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 60, 0.6 + r * 0.15, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: ribbonColors[r],
        transparent: true,
        opacity: 0.3 - r * 0.04,
        blending: THREE.AdditiveBlending
      });
      const ribbon = new THREE.Mesh(tubeGeo, tubeMat);
      ribbon.userData = { basePoints: points.map(p => p.clone()), segments, yBase, phase: r };
      this.world.add(ribbon);
      this.auroraRibbons.push(ribbon);
    }
  }

  /* ═══════════════════════════════════════════════════
     5. AGENCY DATA NODES (Spinning Icosahedrons)
     ═══════════════════════════════════════════════════ */
  _createAgencyNodes() {
    const agencies = [
      { id: 'ieee', name: 'IEEE Xplore', color: 0x00ffcc, pos: [-40, 12, 10] },
      { id: 'arxiv', name: 'arXiv.org', color: 0xff0055, pos: [42, 10, -5] },
      { id: 'acm', name: 'ACM DL', color: 0x00ddff, pos: [-44, -6, -12] },
      { id: 'springer', name: 'Springer Nature', color: 0xffaa00, pos: [44, -8, 8] },
      { id: 'wiki', name: 'Wikipedia', color: 0xaa00ff, pos: [0, 26, -18] },
      { id: 'rg', name: 'ResearchGate', color: 0x00ff88, pos: [-22, 22, 5] },
      { id: 'turnitin', name: 'Turnitin Global', color: 0xff007f, pos: [24, -16, 14] }
    ];

    agencies.forEach((a) => {
      const group = new THREE.Group();
      group.position.set(...a.pos);

      // Icosahedron core
      const icoGeo = new THREE.IcosahedronGeometry(3.5, 0);
      const icoMat = new THREE.MeshStandardMaterial({
        color: a.color,
        emissive: a.color,
        emissiveIntensity: 0.8,
        roughness: 0.15,
        metalness: 0.85,
        wireframe: false
      });
      const ico = new THREE.Mesh(icoGeo, icoMat);
      group.add(ico);

      // Wireframe cage
      const wireGeo = new THREE.IcosahedronGeometry(4.2, 0);
      const wireMat = new THREE.MeshBasicMaterial({
        color: a.color,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      group.add(wire);

      // Neon ring
      const ringGeo = new THREE.TorusGeometry(5.8, 0.2, 16, 40);
      const ringMat = new THREE.MeshBasicMaterial({
        color: a.color,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Local glow light
      const ptLight = new THREE.PointLight(a.color, 1.0, 35);
      group.add(ptLight);

      group.userData = {
        agencyId: a.id, name: a.name, color: a.color,
        basePos: new THREE.Vector3(...a.pos),
        rotSpeed: [0.012 + Math.random() * 0.008, 0.016 + Math.random() * 0.01],
        pointLight: ptLight
      };

      this.agencyNodes.push(group);
      this.world.add(group);

      // Field line (electromagnetic connection from mouse to node)
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), new THREE.Vector3()
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: a.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });
      const fieldLine = new THREE.Line(lineGeo, lineMat);
      this.world.add(fieldLine);
      this.fieldLines.push({ line: fieldLine, target: group });
    });
  }

  /* ═══════════════════════════════════════════════════
     6. HOLOGRAPHIC PARTICLE NEBULA
     ═══════════════════════════════════════════════════ */
  _createNebula() {
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0x00ffcc),
      new THREE.Color(0xff00aa),
      new THREE.Color(0x6600ff),
      new THREE.Color(0x00aaff),
      new THREE.Color(0xffcc00)
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 250;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.nebulaMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.nebula = new THREE.Points(geo, this.nebulaMat);
    this.world.add(this.nebula);
  }

  /* ═══════════════════════════════════════════════════
     EVENT LISTENERS
     ═══════════════════════════════════════════════════ */
  _bindEvents() {
    window.addEventListener('resize', () => this._onResize());

    const trackMouse = (cx, cy) => {
      const nx = (cx / window.innerWidth - 0.5) * 2;
      const ny = -(cy / window.innerHeight - 0.5) * 2;
      this.mouse.tx = nx;
      this.mouse.ty = ny;

      // Unproject into 3D
      const v = new THREE.Vector3(nx, ny, 0.5);
      v.unproject(this.camera);
      const dir = v.sub(this.camera.position).normalize();
      const d = (10 - this.camera.position.z) / dir.z;
      this.mouseWorldTarget.copy(this.camera.position.clone().add(dir.multiplyScalar(d)));
    };

    window.addEventListener('mousemove', (e) => trackMouse(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) trackMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  _onResize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  /* ═══════════════════════════════════════════════════
     THEME SWITCHING
     ═══════════════════════════════════════════════════ */
  setTheme(isDark) {
    this.isDark = isDark;
    if (isDark) {
      this.scene.fog.color.setHex(0x020510);
      this.ambientLight.color.setHex(0x0a0a1e);
      this.ambientLight.intensity = 1.5;
      this.keyLight.color.setHex(0x00ffcc);
      this.fillLight.color.setHex(0xff00aa);
      if (this.floorMat) this.floorMat.color.setHex(0x020510);
      if (this.orbCoreMat) this.orbCoreMat.color.setHex(0x00ffcc);
      if (this.trailMat) this.trailMat.color.setHex(0x00ffcc);
    } else {
      this.scene.fog.color.setHex(0xedf2f7);
      this.ambientLight.color.setHex(0x94a3b8);
      this.ambientLight.intensity = 2.8;
      this.keyLight.color.setHex(0x0284c7);
      this.fillLight.color.setHex(0x8b5cf6);
      if (this.floorMat) this.floorMat.color.setHex(0xe2e8f0);
      if (this.orbCoreMat) this.orbCoreMat.color.setHex(0x0284c7);
      if (this.trailMat) this.trailMat.color.setHex(0x0284c7);
    }
  }

  /* ═══════════════════════════════════════════════════
     SCAN ANIMATION API
     ═══════════════════════════════════════════════════ */
  startScanAnimation() { this.isScanning = true; this.scanPhase = 0; }
  stopScanAnimation() { this.isScanning = false; }

  highlightTopAgency(agencyId) {
    this.agencyNodes.forEach((node) => {
      const match = node.userData.agencyId === agencyId;
      const core = node.children[0];
      const wire = node.children[1];
      const ring = node.children[2];
      const light = node.userData.pointLight;

      if (match) {
        node.scale.set(1.6, 1.6, 1.6);
        if (core && core.material) core.material.emissiveIntensity = 2.5;
        if (wire && wire.material) wire.material.opacity = 1.0;
        if (ring) ring.scale.set(1.4, 1.4, 1.4);
        if (light) light.intensity = 4.0;
      } else {
        node.scale.set(0.85, 0.85, 0.85);
        if (core && core.material) core.material.emissiveIntensity = 0.4;
        if (wire && wire.material) wire.material.opacity = 0.3;
        if (ring) ring.scale.set(1.0, 1.0, 1.0);
        if (light) light.intensity = 0.6;
      }
    });
  }

  resetHighlights() {
    this.agencyNodes.forEach((node) => {
      node.scale.set(1, 1, 1);
      const core = node.children[0];
      const wire = node.children[1];
      const ring = node.children[2];
      const light = node.userData.pointLight;
      if (core && core.material) core.material.emissiveIntensity = 0.8;
      if (wire && wire.material) wire.material.opacity = 0.6;
      if (ring) ring.scale.set(1.0, 1.0, 1.0);
      if (light) light.intensity = 1.0;
    });
  }

  /* ═══════════════════════════════════════════════════
     MAIN RENDER LOOP
     ═══════════════════════════════════════════════════ */
  _loop() {
    requestAnimationFrame(() => this._loop());
    const t = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.06;
    this.mouseWorld.lerp(this.mouseWorldTarget, 0.07);

    // Parallax world tilt
    this.world.rotation.y = this.mouse.x * 0.06;
    this.world.rotation.x = -this.mouse.y * 0.04;

    // ── Mouse Orb ──
    if (this.orbGroup) {
      this.orbGroup.position.copy(this.mouseWorld);
      this.corona.rotation.z += 0.035;
      this.corona.rotation.x += 0.015;
      this.ring2.rotation.y += 0.025;
      this.ring3.rotation.z -= 0.02;

      const pulse = 1.0 + Math.sin(t * 5) * 0.12;
      this.orbCore.scale.set(pulse, pulse, pulse);
      this.orbGlow.scale.set(pulse * 1.05, pulse * 1.05, pulse * 1.05);
      this.mouseLight.intensity = (this.isScanning ? 8 : 5) + Math.sin(t * 7) * 1;
    }

    // ── Mouse Trails ──
    if (this.trailPoints && this.mouseTrails.length > 0) {
      for (let i = this.mouseTrails.length - 1; i > 0; i--) {
        this.mouseTrails[i].lerp(this.mouseTrails[i - 1], 0.4);
      }
      this.mouseTrails[0].copy(this.mouseWorld);
      const pos = this.trailPoints.geometry.attributes.position;
      for (let i = 0; i < this.mouseTrails.length; i++) {
        pos.setXYZ(i, this.mouseTrails[i].x, this.mouseTrails[i].y, this.mouseTrails[i].z);
      }
      pos.needsUpdate = true;
    }

    // ── Hex Floor Pulse ──
    if (this.hexMeshes) {
      this.hexMeshes.forEach((hex) => {
        const dist = new THREE.Vector2(
          hex.position.x - this.mouseWorld.x,
          hex.position.z - this.mouseWorld.z
        ).length();
        const proximity = Math.max(0, 1 - dist / 50);
        hex.material.opacity = hex.userData.baseOpacity + proximity * 0.5 +
          Math.sin(t * 3 + hex.userData.phase) * 0.05;
      });
    }

    // ── DNA Helix Rotation ──
    if (this.helixGroup) {
      this.helixGroup.rotation.y = t * 0.15;
      this.helixGroup.position.y = 5 + Math.sin(t * 0.8) * 3;
    }

    // ── Aurora Ribbons Undulation ──
    this.auroraRibbons.forEach((ribbon) => {
      ribbon.rotation.y = Math.sin(t * 0.3 + ribbon.userData.phase) * 0.05;
      ribbon.position.y = Math.sin(t * 0.5 + ribbon.userData.phase) * 2;
    });

    // ── Agency Nodes + Field Lines ──
    this.agencyNodes.forEach((node, idx) => {
      const u = node.userData;
      node.rotation.x += u.rotSpeed[0];
      node.rotation.y += u.rotSpeed[1];
      node.position.y = u.basePos.y + Math.sin(t * 1.8 + idx * 0.7) * 2;

      // Electromagnetic field lines
      const fl = this.fieldLines[idx];
      if (fl) {
        const dist = node.position.distanceTo(this.mouseWorld);
        const maxD = 65;
        if (dist < maxD) {
          fl.line.geometry.setFromPoints([this.mouseWorld.clone(), node.position.clone()]);
          fl.line.material.opacity = (1 - dist / maxD) * 0.7;
        } else {
          fl.line.material.opacity = 0;
        }
      }
    });

    // ── Nebula Drift ──
    if (this.nebula) {
      this.nebula.rotation.y = t * 0.012;
      this.nebula.rotation.x = Math.sin(t * 0.2) * 0.01;
    }

    // ── Scan Animation ──
    if (this.isScanning) {
      this.scanPhase += 0.08;
      this.keyLight.intensity = 4.5 + Math.sin(t * 15) * 2;
      this.fillLight.intensity = 3.5 + Math.cos(t * 15) * 1.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Interactive3DScene = Interactive3DScene;
