import { Dict } from '@mp/core';
import { SceneComponent } from '@mp/common';
import { Camera } from 'three';


class TagsComponent extends SceneComponent {
  private cameraPose: any = null;
  private iframe: HTMLElement = null;
  private projectionCam = new Camera();

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
  }

  onEvent(eventType: string, eventData: Dict) {
    console.log(this.iframe);
    console.log(this.cameraPose);
    console.log(this.projectionCam);

  }

  private onCameraPoseChanged(pose: any) {
    this.cameraPose = pose;
  }
}

export const tagsType = 'vt.tags';

export const createTagsClosure = function(sdk: any) {
  return function() {
    return new TagsComponent(sdk);
  }
}
