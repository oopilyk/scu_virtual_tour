import { Dict } from '@mp/core';
import { SceneComponent, ComponentInteractionType } from '@mp/common';
import { Camera, Mesh, Object3D, Vector3 } from 'three';

interface Inputs {
  image: string,
  width: number,
  height: number,
  pRotationX: number,
  pRotationY: number, 
  pRotationZ: number, 
  mRotationX: number, 
  mRotationY: number, 
  mRotationZ: number
}

class SignComponent extends SceneComponent {
  private cameraPose: any = null;
  private iframe: HTMLElement = null;
  private projectionCam = new Camera();
  private sphere: Mesh|null = null;
  private hovered = false;
  private sphereWP = new Vector3();

  inputs: Inputs = {
    image: "",
    width: 0,
    height: 0,
    pRotationX: 0,
    pRotationY: 0, 
    pRotationZ: 0, 
    mRotationX: 0, 
    mRotationY: 0, 
    mRotationZ: 0
  };

  events = {
    captured: true,
  }

  constructor( private sdk: any) {
    super();
  }

  onInit() {
    const { image, width, height, pRotationY, pRotationZ, mRotationX, mRotationY } = this.inputs;
    let THREE = this.context.three;
    const planeGeometry = new THREE.PlaneGeometry(width, height);
    const texture = new THREE.TextureLoader().load(`/images/tags/${image}`);
    var mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
      map: texture,
      side: THREE.DoubleSide
    });
    planeGeometry.rotateY(pRotationY);
    planeGeometry.rotateZ(pRotationZ);
    const mesh = new THREE.Mesh(planeGeometry, mat);
    mesh.rotation.x = mRotationX;
    mesh.rotation.y = mRotationY;
    this.outputs.objectRoot = mesh;
    this.outputs.collider = mesh;
    console.log("in init of the text");
   
  }
    onEvent(eventType: string, eventData: Dict): void {
       console.log(this.cameraPose);
       console.log(this.iframe);
       console.log(this.projectionCam);
       console.log(this.hovered);
       if (eventType === ComponentInteractionType.CLICK) {
        this.sphere.getWorldPosition(this.sphereWP);
        this.notify(eventType, {
          position: this.sphereWP,
        });
   
      }
      if (eventType === ComponentInteractionType.HOVER) {
        this.hovered = eventData.hover
      }
    }

}

export const signType = 'vt.sign';

export const createSignClosure = function(sdk: any) {
  return function() {
    return new SignComponent(sdk);
  }
}
