import React, { Component } from 'react';
import { GetSDK, sdkKey } from '@mp/common';
import { createNavPathClosure, navPathType } from '../scene-components/NavPathComponent';
import { FrameView } from './Frame';
import bunnies from '../../assets/bunnies.json';
import sourceDescs from '../../assets/sources.json';
import hotspots from '../../assets/hotspots.json';
export const ModelSid = 'eE6srFdgFSR';
import icon2 from '../images/tags/big1.jpg';
import { getImage } from '../utils/CustomizeTags';
import { createSignClosure, signType } from '../scene-components/SignComponent';


interface Props {}

interface State {
  
}

const setMessage = function(element: HTMLElement, message: string) {
  element.classList.remove('hidden');
  element.classList.add('visible');
  element.innerText = message;
}

const clearMessage = function(element: HTMLElement) {
  element.classList.remove('visible');
  element.classList.add('hidden');
}

function addMattertagNode1(sdk: any, isMobile: boolean) {
  let matterTags: any = [];
  hotspots.map((e) => {
    matterTags.push({
      label: e.title,
      description: e.description,
      anchorPosition: {
        x: e.positionX,
        y: e.positionY,
        z: e.positionZ,
      },
      stemVector: { x: e.stemVectorX, y: e.stemVectorY, z: e.stemVectorZ },
      mediaType: e.type,
      mediaSrc: e.url,
      media: {
        type: "mattertag.media." + e.type,
        src: e.url,
      }
    });
  });
  // @ts-ignore 
  sdk.Mattertag.add(matterTags).then(function (mattertagIds) {
    console.log(mattertagIds);
    sdk.Mattertag.getData()
      .then(function (mattertags: { sid: any, label: any }[]) {

        for (let i = 0; i < matterTags.length; i++) {
          window.matchMedia("(min-width: 768px)").matches ? sdk.Asset.registerTexture(`${mattertags[i].sid}1`, getImage(mattertags[i].label)) : sdk.Mattertag.registerIcon(`${mattertags[i].sid}1`, icon2);
          sdk.Mattertag.editIcon(mattertags[i].sid, `${mattertags[i].sid}1`);
        }

      }).catch(function (error: any) {
        console.log(error);
      });
  });
}

export class MainView extends Component<Props, State> {
  private sdk: any = null;
  // hard coding the total number of bunnies to win
  private rootRef: React.RefObject<HTMLDivElement>;
  private queryString: string = '';
  private sdkKey: string = sdkKey;

  constructor(props: {}) {
    super(props);
    this.rootRef = React.createRef<HTMLDivElement>();
    //this.isMobile = window.matchMedia("(min-width: 768px)").matches;

    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('m')) {
      urlParams.set('m', ModelSid);
    }
    // ensure applicationKey is inserted into the bundle query string
    if (urlParams.has('applicationKey')) {
      this.sdkKey = urlParams.get('applicationKey');
    }
    else {
      urlParams.set('applicationKey', 'prigk78dz4crrmb7p98czk0kc');
    }

    this.queryString = urlParams.toString();

    }
 
  async componentDidMount() {
    this.sdk = await GetSDK('sdk-iframe', this.sdkKey);
    addMattertagNode1(this.sdk, false);
    (window as any).getPose = this.sdk.Camera.getPose;
    const sensor = await this.sdk.Sensor.createSensor(this.sdk.Sensor.SensorType.CAMERA);
    sensor.showDebug(true);

    sensor.readings.subscribe({
      onCollectionUpdated: (sourceCollection: any) => {
        const inRange: any[] = [];
        for (const [source, reading] of sourceCollection) {
          if (reading.inRange) {
            const search = inRange.find((element) => {
              return element === source.userData.id;
            });
            if (!search) {
              inRange.push(source.userData.id);
            }
          }

          console.log(
            `sensor id: ${source.userData.id} inRange:${reading.inRange} inView:${reading.inView}`
          );
        }
        if (inRange.length > 0) {
          console.log("I am in range");
          setMessage(document.getElementById('text'), inRange.toString());
        }
        else {
          console.log("I am out of range");
          clearMessage(document.getElementById('text'));
        }
      }
    });

    const sourcePromises = [];
    for (const desc of sourceDescs) {
      sourcePromises.push(this.sdk.Sensor.createSource(desc.type, desc.options));
    }

    const sources = await Promise.all(sourcePromises);
    sensor.addSource(...sources);

    await Promise.all([
      this.sdk.Scene.register(navPathType, createNavPathClosure(this.sdk)),
      this.sdk.Scene.register(signType, createSignClosure(this.sdk))
    ]);

    const nodes = await this.sdk.Scene.deserialize(JSON.stringify(bunnies));
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].start();
    }
  }

  render() {
    const src = `./bundle/showcase.html?${this.queryString}&help=1&play=0&qs=1&log=0&tour=3&hr=1&pin=0&hl=1&&title=1`;
    return (
      <div ref={this.rootRef}>
        <div id="text" className="hidden"></div>
        <FrameView src={src}></FrameView>
      </div>
    );
  }
}


