import React, { useEffect, useRef } from 'react';
import type { Character } from '../types';
import './CharacterViewer.css';

interface CharacterViewerProps {
  character: Character;
}

const CharacterViewer: React.FC<CharacterViewerProps> = ({ character }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const THREE = (window as any).THREE;
    if (!THREE) {
      console.error("Three.js has not been loaded.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2a);
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3.5);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(3, 4, 2);
    scene.add(keyLight);

    const loader = new THREE.GLTFLoader();
    let mixer: any;
    loader.load(character.modelPath, (gltf: any) => {
      const model = gltf.scene;
      const animations = gltf.animations;

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 1.8 / size.y;
      model.scale.set(scale, scale, scale);

      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center).setY(-box.min.y * scale);

      scene.add(model);

      if (animations && animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(animations[0]);
        action.play();
      }

      model.visible = false;
      const gsap = (window as any).gsap;
      if (gsap) {
        gsap.to(model.rotation, {
          duration: 1,
          y: Math.PI * 2,
          ease: 'power2.inOut',
          onStart: () => {
            model.visible = true;
          }
        });
      } else {
        model.visible = true;
      }
    });

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      if (mixer) {
        mixer.update(clock.getDelta());
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [character]);

  return <canvas ref={canvasRef} className="character-viewer-canvas" />;
};

export default CharacterViewer;
