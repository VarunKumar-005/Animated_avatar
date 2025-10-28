import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Character } from '../types';
import './CharacterViewer.css';

interface CharacterViewerProps {
  character: Character;
}

const CharacterViewer: React.FC<CharacterViewerProps> = ({ character }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer;
    loader.load(character.modelPath, (gltf) => {
      const model = gltf.scene;
      const animations = gltf.animations;

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 1.8 / size.y;
      model.scale.set(scale, scale, scale);

      if (character.position) {
        model.position.add(new THREE.Vector3(character.position.x, character.position.y, character.position.z));
      }

      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center).setY(-box.min.y * scale);

      scene.add(model);

      if (animations && animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(animations[0]);
        action.play();
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
