import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CHARACTERS } from '../constants';
import type { Character } from '../types';
import { Volume2, VolumeX, Settings, ChevronLeft, ChevronRight, Info, Lock, HelpCircle } from './icons';
import PurchaseModal from './PurchaseModal';

interface SceneRef {
  scene: any;
  camera: any;
  renderer: any;
  glow: any;
  currentModel: any;
  rotationTween: any;
  mixers: any[];
  currentAction: any;
}

const formatAnimationName = (name: string) => {
  if (!name) return "Animation";
  return name
    .replace(/mixamorig|character|_/gi, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
};

const tourSteps = [
    { selector: '#character-carousel', text: 'Welcome! Use these buttons or your arrow keys to browse available avatars.', position: 'top' },
    { selector: '#info-panel', text: 'Here you can see the selected avatar\'s skills and specialty. You can also preview their animations if available.', position: 'left' },
    { selector: '#equip-button', text: 'Once you\'ve chosen an avatar, select it here. Premium avatars need to be unlocked first.', position: 'left' },
    { selector: '#settings-button', text: 'Adjust graphics quality and toggle auto-rotation in the settings menu.', position: 'bottom' },
];

const DragonWarriorLobby: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneRef | null>(null);
  const [selectedChar, setSelectedChar] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [quality, setQuality] = useState('high');
  const [muted, setMuted] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [animations, setAnimations] = useState<any[]>([]);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  const characters: Character[] = CHARACTERS;
  const selectedCharacter = characters[selectedChar];

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setUnlockedAvatars(JSON.parse(localStorage.getItem('unlockedAvatars') || '[]'));
        const tourCompleted = localStorage.getItem('tourCompleted');
        if (!tourCompleted) {
            setIsTourActive(true);
        }
    }
  }, []);

  const handleUnlockCharacter = (characterId: string) => {
    const newUnlocked = [...unlockedAvatars, characterId];
    setUnlockedAvatars(newUnlocked);
    localStorage.setItem('unlockedAvatars', JSON.stringify(newUnlocked));
  };
  
  const createPlaceholderModel = useCallback((index: number) => {
    const THREE = (window as any).THREE;
    const char = characters[index];
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
        color: char.color, roughness: 0.1, metalness: 0.2, emissive: char.color, emissiveIntensity: 0.8,
    });
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 1, 8, 16);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1; body.castShadow = quality === 'high'; group.add(body);
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.7; head.castShadow = quality === 'high'; group.add(head);
    return group;
  }, [characters, quality]);

  const loadCharacterModel = useCallback((index: number) => {
    if (!sceneRef.current) return;
    setIsLoadingModel(true); setAnimations([]); setCurrentAnimationIndex(0);
    const THREE = (window as any).THREE;
    const gsap = (window as any).gsap;
    const { scene, glow, mixers } = sceneRef.current;
    const char = characters[index];
    mixers.length = 0;
    if (sceneRef.current.currentModel) { scene.remove(sceneRef.current.currentModel); }
    if (sceneRef.current.currentAction) { sceneRef.current.currentAction = null; }
    
    const isGltf = char.modelPath.toLowerCase().endsWith('.glb') || char.modelPath.toLowerCase().endsWith('.gltf');
    const loader = isGltf ? new THREE.GLTFLoader() : new THREE.FBXLoader();
    loader.load(char.modelPath, (loadedObject: any) => {
        const model = isGltf ? loadedObject.scene : loadedObject;
        const modelAnimations = loadedObject.animations;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = 1.8 / size.y;
        model.scale.set(scale, scale, scale);
        const postScaleBox = new THREE.Box3().setFromObject(model);
        const center = postScaleBox.getCenter(new THREE.Vector3());
        model.position.sub(center).setY(-postScaleBox.min.y);
        model.traverse((child: any) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        scene.add(model);
        sceneRef.current!.currentModel = model;
        if (modelAnimations && modelAnimations.length > 0) {
            setAnimations(modelAnimations);
            const mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(modelAnimations[0]);
            action.play(); mixers.push(mixer);
            sceneRef.current!.currentAction = action;
        } else { setAnimations([]); }
        if (glow) glow.material.color.set(char.color);
        gsap.fromTo(model.rotation, { y: Math.PI * 0.3 }, { y: 0, duration: 0.6, ease: 'power2.out' });
        setIsLoadingModel(false);
    }, undefined, (error) => {
        console.error(`Error loading model for ${char.name}:`, error);
        const fallbackGroup = createPlaceholderModel(index);
        scene.add(fallbackGroup); sceneRef.current!.currentModel = fallbackGroup;
        if (glow) glow.material.color.set(char.color); setIsLoadingModel(false);
    });
  }, [characters, createPlaceholderModel]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if ((window as any).THREE && (window as any).gsap && (window as any).THREE.FBXLoader && (window as any).THREE.GLTFLoader) {
        setScriptsReady(true); clearInterval(intervalId);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!scriptsReady) return;
    const THREE = (window as any).THREE;
    let animationId: number;
    const canvas = canvasRef.current; if (!canvas) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f); scene.fog = new THREE.Fog(0x0a0a0f, 5, 15);
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3.5); camera.lookAt(0, 1, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.shadowMap.enabled = quality === 'high';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(new THREE.AmbientLight(0x4a4a5e, 0.4));
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    keyLight.position.set(3, 4, 2); keyLight.castShadow = quality === 'high';
    keyLight.shadow.mapSize.set(2048, 2048); scene.add(keyLight);
    scene.add(new THREE.DirectionalLight(0x88aaff, 0.6).position.set(-2, 2, -1));
    scene.add(new THREE.DirectionalLight(0x5a2d91, 2.5).position.set(0, 3, -3));
    const ground = new THREE.Mesh(new THREE.CircleGeometry(3, 32), new THREE.MeshStandardMaterial({ color: 0x0f0f1a, roughness: 0.9, metalness: 0.1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; ground.receiveShadow = true; scene.add(ground);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.8, 32), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = 0.02; scene.add(glow);
    sceneRef.current = { scene, camera, renderer, glow, currentModel: null, rotationTween: null, mixers: [], currentAction: null };
    loadCharacterModel(selectedChar);
    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      sceneRef.current?.mixers.forEach(mixer => mixer.update(delta));
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); renderer.dispose(); };
  }, [scriptsReady, quality, loadCharacterModel]); 

  useEffect(() => {
    if (!scriptsReady || !sceneRef.current || !(window as any).gsap) return;
    const gsap = (window as any).gsap;
    gsap.to('.overlay-dim', { opacity: 0.15, duration: 0.12, onComplete: () => {
      gsap.to('.overlay-dim', { opacity: 1, duration: 0.3 });
    }});
    loadCharacterModel(selectedChar);
  }, [scriptsReady, selectedChar, loadCharacterModel, characters]);
  
  useEffect(() => {
    const sr = sceneRef.current;
    if (!scriptsReady || !sr || !sr.currentModel || (animations && animations.length > 0)) {
        if (sr?.rotationTween) { sr.rotationTween.kill(); sr.rotationTween = null; }
        return;
    }
    const { currentModel } = sr; const gsap = (window as any).gsap;
    if (autoRotate) {
        if (sr.rotationTween) sr.rotationTween.kill();
        sr.rotationTween = gsap.to(currentModel.rotation, { y: `+=${Math.PI * 2}`, duration: 12, repeat: -1, ease: 'none', });
    } else { if (sr.rotationTween) { sr.rotationTween.kill(); sr.rotationTween = null; } }
  }, [autoRotate, scriptsReady, animations, isLoadingModel]);

  useEffect(() => {
    if (!sceneRef.current || !sceneRef.current.currentModel || animations.length <= 1) return;
    const { mixers, currentAction } = sceneRef.current; if (mixers.length === 0) return;
    const mixer = mixers[0]; const clip = animations[currentAnimationIndex]; if (!clip) return;
    const newAction = mixer.clipAction(clip);
    if (currentAction && currentAction !== newAction) {
        currentAction.fadeOut(0.3); newAction.reset().fadeIn(0.3).play();
    } else { newAction.play(); }
    sceneRef.current.currentAction = newAction;
  }, [currentAnimationIndex, animations]);

  const selectChar = (index: number) => { setSelectedChar(index); setShowInfo(true); };
  const prevChar = () => setSelectedChar((prev) => (prev - 1 + characters.length) % characters.length);
  const nextChar = () => setSelectedChar((prev) => (prev + 1) % characters.length);
  const handlePrevAnimation = () => setCurrentAnimationIndex(prev => (prev - 1 + animations.length) % animations.length);
  const handleNextAnimation = () => setCurrentAnimationIndex(prev => (prev + 1) % animations.length);
  
  const isUnlocked = !selectedCharacter.isPremium || unlockedAvatars.includes(selectedCharacter.id);
  const equipButtonText = isUnlocked ? ( 'Select Avatar') : 'Upgrade to Unlock';

  const [equipStatus, setEquipStatus] = useState(equipButtonText);
  useEffect(() => { setEquipStatus(equipButtonText) }, [equipButtonText]);

  const handleEquip = () => {
    if (isUnlocked) {
      setEquipStatus('Selected!');
      setTimeout(() => setEquipStatus(equipButtonText), 2000);
    } else {
      setShowPurchaseModal(true);
    }
  };
  
  const startTour = () => { setTourStep(0); setIsTourActive(true); };
  const advanceTour = () => {
    if (tourStep < tourSteps.length - 1) { setTourStep(tourStep + 1); } 
    else { endTour(); }
  };
  const endTour = () => { setIsTourActive(false); localStorage.setItem('tourCompleted', 'true'); };
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 overflow-hidden font-sans">
      {isTourActive && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={endTour}></div>}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-label="3D Character Preview"/>
      {isLoadingModel && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"><div className="text-white text-lg font-semibold bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-lg">Loading Avatar...</div></div>)}
      <div className="absolute inset-0 pointer-events-none opacity-30">{[...Array(20)].map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }}/>))}</div>

      <header className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
        <div><h1 className="text-3xl font-bold tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">AR/VR Learning Avatars</h1><p className="text-sm text-gray-400 mt-1">Choose your learning guide</p></div>
        <div className="flex gap-3">
          <button onClick={startTour} className="w-10 h-10 rounded-lg bg-slate-900/60 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center text-purple-300 hover:bg-purple-900/40 transition-all" aria-label="Help"><HelpCircle size={18} /></button>
          <button onClick={() => setMuted(!muted)} className="w-10 h-10 rounded-lg bg-slate-900/60 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center text-purple-300 hover:bg-purple-900/40 transition-all" aria-label={muted ? 'Unmute' : 'Mute'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          <button id="settings-button" onClick={() => setShowSettings(!showSettings)} className="relative w-10 h-10 rounded-lg bg-slate-900/60 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center text-purple-300 hover:bg-purple-900/40 transition-all" aria-label="Settings"><Settings size={18} /></button>
        </div>
      </header>

      {showSettings && (
        <div className="absolute top-20 right-6 w-64 bg-slate-900/95 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 z-20 shadow-2xl">
          <h3 className="text-white font-semibold mb-3">Settings</h3><div className="space-y-3">
            <div><label className="text-sm text-gray-400 block mb-1">Quality</label><select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm border border-purple-500/20 focus:ring-purple-500 focus:border-purple-500"><option value="low">Low</option><option value="high">High</option></select></div>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-400">Auto Rotate</label><button onClick={() => setAutoRotate(!autoRotate)} className={`w-12 h-6 rounded-full transition-colors ${autoRotate ? 'bg-purple-600' : 'bg-slate-700'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${autoRotate ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
          </div>
        </div>
      )}
      
      {showPurchaseModal && <PurchaseModal character={selectedCharacter} onClose={() => setShowPurchaseModal(false)} onUnlock={handleUnlockCharacter} />}

      <aside id="info-panel" className={`overlay-dim absolute top-1/2 right-6 -translate-y-1/2 w-80 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 z-10 transition-all duration-300 ${showInfo ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
        <div className="flex items-start justify-between mb-4"><div><div className="flex items-center gap-2 mb-1"><h2 className="text-2xl font-bold text-white">{selectedCharacter.name}</h2>{selectedCharacter.isPremium && (<span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">PREMIUM</span>)}</div><span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: `${selectedCharacter.color}40`, color: selectedCharacter.color }}>{selectedCharacter.role}</span></div><button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white transition-colors" aria-label="Close info">✕</button></div>
        <div className="space-y-3 mb-6">{Object.entries(selectedCharacter.skills).map(([skill, value]) => (<div key={skill}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400 capitalize">{skill}</span><span className="text-white font-semibold">{value}</span></div><div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${selectedCharacter.color}, ${selectedCharacter.color}dd)` }} /></div></div>))}</div>
        <div className="mb-6"><h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Specialty</h3><p className="text-sm text-gray-300">{selectedCharacter.specialty}</p></div>
        {animations.length > 1 && (<div className="mb-6"><h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Animation</h3><div className="flex items-center justify-between bg-slate-800 rounded-lg p-2"><button onClick={handlePrevAnimation} className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-slate-700" aria-label="Previous Animation"><ChevronLeft size={18} /></button><span className="text-sm text-gray-300 truncate px-2 text-center flex-1">{formatAnimationName(animations[currentAnimationIndex]?.name)}</span><button onClick={handleNextAnimation} className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-slate-700" aria-label="Next Animation"><ChevronRight size={18} /></button></div></div>)}
        <div className="flex gap-3">
            <button id="equip-button" onClick={handleEquip} className={`relative flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 ${!isUnlocked ? 'bg-amber-600 hover:bg-amber-500' : ''}`} style={isUnlocked ? { background: `linear-gradient(135deg, ${selectedCharacter.color}, ${selectedCharacter.color}cc)` } : {}}>{equipStatus}</button>
            <button className="px-4 py-3 rounded-lg bg-slate-800 text-gray-300 hover:bg-slate-700 transition-all"><Info size={20} /></button>
        </div>
      </aside>

      <footer id="character-carousel" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="relative flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-full px-6 py-4">
          <button onClick={prevChar} className="text-purple-300 hover:text-purple-100 transition-colors" aria-label="Previous character"><ChevronLeft size={24} /></button>
          <div className="flex gap-4">
            {characters.map((char, index) => (
              <button key={char.id} onClick={() => selectChar(index)} className={`relative w-16 h-16 rounded-full transition-all duration-300 ${selectedChar === index ? 'scale-125 ring-4 ring-offset-2 ring-offset-slate-900' : 'scale-100 hover:scale-110 opacity-60 hover:opacity-100'}`} style={{ background: `linear-gradient(135deg, ${char.color}, ${char.color}aa)`, '--tw-ring-color': selectedChar === index ? char.color : 'transparent' } as React.CSSProperties} aria-label={`Select ${char.name}`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                {char.isPremium && !unlockedAvatars.includes(char.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full"><Lock size={28} className="text-amber-300 drop-shadow-lg" /></div>
                )}
                {selectedChar === index && <div className="absolute -inset-1 rounded-full animate-ping opacity-30" style={{ background: char.color }} />}
              </button>
            ))}
          </div>
          <button onClick={nextChar} className="text-purple-300 hover:text-purple-100 transition-colors" aria-label="Next character"><ChevronRight size={24} /></button>
        </div>
      </footer>
      
      {isTourActive && (
        <div className="absolute z-50 transition-all duration-300" style={{
            top: document.querySelector(tourSteps[tourStep].selector)?.getBoundingClientRect().top,
            left: document.querySelector(tourSteps[tourStep].selector)?.getBoundingClientRect().left,
            width: document.querySelector(tourSteps[tourStep].selector)?.getBoundingClientRect().width,
            height: document.querySelector(tourSteps[tourStep].selector)?.getBoundingClientRect().height,
        }}>
            <div className="absolute -inset-2 border-2 border-purple-500 border-dashed rounded-lg animate-pulse"></div>
            <div className={`absolute bg-slate-800 text-white p-4 rounded-lg shadow-2xl w-64 ${
                tourSteps[tourStep].position === 'top' ? 'bottom-full mb-4' : 
                tourSteps[tourStep].position === 'bottom' ? 'top-full mt-4' :
                tourSteps[tourStep].position === 'left' ? 'right-full mr-4' : 'left-full ml-4'
            }`}>
                <p className="text-sm">{tourSteps[tourStep].text}</p>
                <div className="flex justify-between items-center mt-4">
                    <button onClick={endTour} className="text-xs text-gray-400 hover:text-white">Skip</button>
                    <button onClick={advanceTour} className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded-md font-semibold">{tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DragonWarriorLobby;