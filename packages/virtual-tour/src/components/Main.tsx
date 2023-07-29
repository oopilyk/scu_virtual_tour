import React, { Component } from 'react';
import { GetSDK, makeSphereSource, sdkKey, sphereSourceType } from '@mp/common';
import { createNavPathClosure, navPathType } from '../scene-components/NavPathComponent';
import { FrameView } from './Frame';
import sweeps from '../../assets/sweeps.json';
import signs from '../../assets/signs.json';
import sourceDescs from '../../assets/sources.json';
import hotspots from '../../assets/hotspots.json';
export const ModelSid = 'eE6srFdgFSR';
import icon2 from '../images/tags/big1.jpg';
import { getImage } from '../utils/CustomizeTags';
import { createSignClosure, signType } from '../scene-components/SignComponent';
import { clearMessage, setMessage } from '../utils/CustomizeMsg';
import {randomColor} from '../utils/colorUtil';


interface Props {}

interface State {
  
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

const makeLight = (sceneObject : any , color:string, position:any) => {
  // add light
  const lightsNode = sceneObject.addNode();

  const ambientLightComponet = lightsNode.addComponent("mp.ambientLight", {
    intensity: 0.5,
    // color: { r: 1.0, g: 0, b: 0 },
  });
 sceneObject.addInputPath(
    ambientLightComponet,
    "intensity",
    "ambientIntensity"
  );
  lightsNode.position.set(position.x, position.y, position.z);
  lightsNode.start();
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
   
    // add sensor for important room
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
          setMessage(inRange.toString());
        }
        else {
          clearMessage();
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
      this.sdk.Scene.register(signType, createSignClosure()),
      this.sdk.Scene.register(sphereSourceType, makeSphereSource(this.sdk))
    ]);

    const [sceneObject] = await this.sdk.Scene.createObjects(1);

    var currentNode = sceneObject.addNode("node-obj-4");
    const sweep_nodes = await this.sdk.Scene.deserialize(JSON.stringify(sweeps));
    this.sdk.Sweep.current.subscribe(function (currentSweep: any) {
			// Change to the current sweep has occurred.

    // add all the navigation sweeps
    for (let i = 0; i < sweep_nodes.length; ++i) {
      let pos = sweep_nodes[i].position;
      makeLight(sceneObject, null, { x: pos.x, y: pos.y, z: pos.z});
      if(currentSweep.position.x!== pos.x && currentSweep.position.z!== pos.z) {
        sweep_nodes[i].start();
      } else {
        console.log("same as current");
      }
    }
    if (currentSweep.sid === '') {
      console.log('Not currently stationed at a sweep position');
    } else {
      const color = randomColor(1, 0, 0); 
      const initObj = {
        color,
        size: 2.0
      };  
		  currentNode.addComponent(navPathType, initObj);
      currentNode.position.set(currentSweep.position.x, currentSweep.position.y + 10, currentSweep.position.z);
      currentNode.start();
    }
		});

    // add all the signs
    const sign_nodes = await this.sdk.Scene.deserialize(JSON.stringify(signs));
    for (let i = 0; i < sign_nodes.length; ++i) {
      sign_nodes[i].start();
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
