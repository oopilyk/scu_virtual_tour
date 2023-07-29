import { Dict } from '@mp/core';
import { SceneComponent, ComponentInteractionType } from '@mp/common';
import { Camera, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three';
import { setMessage, clearMessage } from '../utils/CustomizeMsg';

interface Inputs {
  size: number,
  color: number;
  lineColor: number;
  hoverOpacity: number;
  name: string;
}

class NavPathComponent extends SceneComponent {
  private cameraPose: any = null;
  private iframe: HTMLElement = null;
  private projectionCam = new Camera();
  private root: Object3D|null = null;
  private sphere: Mesh|null = null;
  private opacity = 0;
  private hovered = false;
  private sphereWP = new Vector3();

  inputs: Inputs = {
    size: 1.0,
    color: 0xFF00FF,
    lineColor: 0xFF00FF,
    hoverOpacity: 0.8,
    name: "room"
  };

  events = {
    captured: true,
  }

  constructor( private sdk: any) {
    super();
  }

  onInit() {
    this.onCameraPoseChanged = this.onCameraPoseChanged.bind(this);
    this.iframe = document.getElementById('sdk-iframe');
    this.sdk.Camera.pose.subscribe(this.onCameraPoseChanged);
    const THREE = this.context.three;
    this.root = new THREE.Object3D();
    this.outputs.objectRoot = this.root;
    this.outputs.collider = this.root;

    this.makeSphere();

    this.onCameraPoseChanged = this.onCameraPoseChanged.bind(this);
   
  }
  private makeSphere() {
    const THREE = this.context.three;

    if (this.sphere) {
      this.root.remove(this.sphere);
      (this.sphere.material as MeshBasicMaterial).dispose();
      (this.sphere.geometry as SphereGeometry).dispose();
      this.sphere = null;
    }

    const sphereGeometry = new THREE.SphereGeometry(0.5 * this.inputs.size, 64, 100);

    var sphereMaterial = new THREE.MeshStandardMaterial({
      transparent: false,
      color: this.inputs.color,
      opacity: this.opacity,
      roughness: 4
    });

    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.root.add(this.sphere);
  }

    onEvent(eventType: string, eventData: Dict): void {
       console.log(this.cameraPose);
       console.log(this.iframe);
       console.log(this.projectionCam);
       console.log(this.hovered);
       if (eventType === ComponentInteractionType.CLICK) {
        this.sphere.getWorldPosition(this.sphereWP);
        setMessage(this.inputs.name);
				setTimeout(() => 
					clearMessage()
				, 5000);
        this.notify(eventType, {
          position: this.sphereWP,
        });
   
      }
        if (eventType === ComponentInteractionType.HOVER) {
          this.hovered = eventData.hover
        }
        
      
    }

  private onCameraPoseChanged(pose: any) {
    this.cameraPose = pose;
  }
}

export const navPathType = 'vt.navpath';

export const createNavPathClosure = function(sdk: any) {
  return function() {
    return new NavPathComponent(sdk);
  }
}

