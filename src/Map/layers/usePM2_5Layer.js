import React, { useEffect, useState } from 'react';
import { IconLayer } from '@deck.gl/layers';
import axios from 'axios';
import { EAQI_COLOR_RANGE, EAQI_PM2_5_LABELS, pm2_5ColorScale } from '../scales';
import processLuftData from '../processLuftData';
import Legend from '../Legend';
import icons from '../../assets/img/icon-atlas.png';

import tempData from '../tempData.json';

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

const legend = (
  <Legend
    title="PM 2.5"
    colors={EAQI_COLOR_RANGE}
    labels={EAQI_PM2_5_LABELS}
  />
);

// NOTE: with this temporary solution, if there are multiple layers sharing data sources, it's really inefficient, could be an idea (if we keep this style) to have some sort of "data source" abstraction that a layer could subscribe to, which would only be active if some layer subscribed to it.
async function getData() {
  try {
    const response = await axios.get('http://api.luftdaten.info/v1/filter/area=59.305477,18.105203,0.50');
    console.log(response);
  } catch (error) {
    throw new Error(error);
  }
}

var intervalID = null;

function usePM2_5Layer(data, visible, hoverData, setHoverData) {
  const [layer, setLayer] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // what happens if it stars fetching, then the hook is removed, then the fetch finishes?
  /*useEffect(() => {
    //intervalID = setInterval(getData, 5 * 60 * 1000); // 5 minutes
    console.log('pm2_5 ON');

    setData(processLuftData(tempData))

    
    return () => console.log('pm2_5 OFF');
    //return () => clearInterval(intervalID);
    
    // TODO: return stop fetch data
  }, []);*/
  /*useEffect(() => {
    setData(processLuftData(tempData));

    if (visible) console.log('sub');
    else console.log('unsub (if subbed)');
  }, [visible])*/

  useEffect(() => {
    if (!data) return; // TODO: this isn't gonna work I think... unless the data change causes an update

    setLayer(new IconLayer({
      id: 'particles-icon-layer',
      pickable: true,
      data,
      onHover: info => {
        if (hoverData !== info.object) {
          setHoverData(info.object);
        }
      },
      visible,
      iconAtlas: icons, // this expects a string or a Texture2D object (luma.gl class) so might not work
      iconMapping: ICON_MAPPING,
      sizeScale: 20,
      getIcon: d => 'marker',
      getSize: 5,
      getColor: d => pm2_5ColorScale(d.average_measurements.P2),
    }));
  }, [data, visible, hoverData, setHoverData]);

  useEffect(() => {
    setTooltip(hoverData && (
      <div>
        PM 2.5: {hoverData.average_measurements.P2}
      </div>
    ));
  }, [hoverData]);

  return { layer, tooltip, legend };
}

export default usePM2_5Layer;
