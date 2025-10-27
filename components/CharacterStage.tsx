import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Character } from '../types';
import { ChevronLeft, ChevronRight } from './icons';

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

interface CharacterStageProps {
  character: Character;
  align: 'left' | 'right';
}

const CharacterStage: React.FC<CharacterStageProps> = ({ character, align }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneRef | null>(null);
  const [quality] = useState('high');
  const [autoRotate] = useState(true);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [animations, setAnimations] = useState<any[]>([]);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);

  const createPlaceholderModel = useCallback(() => {
    const THREE = (window as any).THREE;
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
        color: character.color, roughness: 0.1, metalness: 0.2, emissive: character.color, emissiveIntensity: 0.8,
    });
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 1, 8, 16);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1; body.castShadow = quality === 'high'; group.add(body);
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.7; head.castShadow = quality === 'high'; group.add(head);
    return group;
  }, [character, quality]);

  const loadCharacterModel = useCallback(() => {
    if (!sceneRef.current) return;
    setIsLoadingModel(true); setAnimations([]); setCurrentAnimationIndex(0);
    const THREE = (window as any).THREE;
    const gsap = (window as any).gsap;
    const { scene, glow, mixers } = sceneRef.current;

    mixers.length = 0;
    if (sceneRef.current.currentModel) { scene.remove(sceneRef.current.currentModel); }
    if (sceneRef.current.currentAction) { sceneRef.current.currentAction = null; }

    const isGltf = character.modelPath.toLowerCase().endsWith('.glb') || character.modelPath.toLowerCase().endsWith('.gltf');
    const loader = isGltf ? new THREE.GLTFLoader() : new THREE.FBXLoader();
    loader.load(character.modelPath, (loadedObject: any) => {
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
        if (glow) glow.material.color.set(character.color);
        gsap.fromTo(model.rotation, { y: Math.PI * 0.3 }, { y: 0, duration: 0.6, ease: 'power2.out' });
        setIsLoadingModel(false);
    }, undefined, (error) => {
        console.error(`Error loading model for ${character.name}:`, error);
        const fallbackGroup = createPlaceholderModel();
        scene.add(fallbackGroup); sceneRef.current!.currentModel = fallbackGroup;
        if (glow) glow.material.color.set(character.color); setIsLoadingModel(false);
    });
  }, [character, createPlaceholderModel]);

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
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3.5); camera.lookAt(0, 1, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
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
    loadCharacterModel();
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
    loadCharacterModel();
  }, [scriptsReady, character, loadCharacterModel]);

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

  const handlePrevAnimation = () => setCurrentAnimationIndex(prev => (prev - 1 + animations.length) % animations.length);
  const handleNextAnimation = () => setCurrentAnimationIndex(prev => (prev + 1) % animations.length);

  return (
    <div className={`relative w-full h-screen flex items-center ${align === 'left' ? 'justify-start' : 'justify-end'}`}>
        <div className="absolute inset-0 w-full h-full">
            <canvas ref={canvasRef} className="w-full h-full" aria-label="3D Character Preview"/>
            {isLoadingModel && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"><div className="text-white text-lg font-semibold bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-lg">Loading Avatar...</div></div>)}
        </div>
        <div className={`relative z-10 w-[450px] p-8 ${align === 'left' ? 'ml-16' : 'mr-16'}`}>
            <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-white">{character.name}</h2>
                            {character.isPremium && (<span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">PREMIUM</span>)}
                        </div>
                        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: `${character.color}40`, color: character.color }}>
                            {character.role}
                        </span>
                    </div>
                </div>
                <div className="space-y-3 mb-6">
                    {Object.entries(character.skills).map(([skill, value]) => (
                        <div key={skill}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400 capitalize">{skill.replace('_', ' ')}</span>
                                <span className="text-white font-semibold">{value}</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${character.color}, ${character.color}dd)` }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mb-6">
                    <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Specialty</h3>
                    <p className="text-sm text-gray-300">{character.specialty}</p>
                </div>
                {animations.length > 1 && (
                    <div className="mb-6">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Animation</h3>
                        <div className="flex items-center justify-between bg-slate-800 rounded-lg p-2">
                            <button onClick={handlePrevAnimation} className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-slate-700" aria-label="Previous Animation">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm text-gray-300 truncate px-2 text-center flex-1">
                                {formatAnimationName(animations[currentAnimationIndex]?.name)}
                            </span>
                            <button onClick={handleNextAnimation} className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-slate-700" aria-label="Next Animation">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
                 <button className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${character.color}, ${character.color}cc)` }}>
                    Select Avatar
                </button>
            </div>
        </div>
    </div>
  );
};

export default CharacterStage;
