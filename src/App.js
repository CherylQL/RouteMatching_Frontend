import React, {useEffect, useState} from "react";
import "./App.css";
import { Amap, PolylineEditor, Polyline } from "@amap/amap-react";
import Papa from 'papaparse';
import {Layout, Button, Upload, Row} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { addcarPoint } from './store/action/index';
import { store } from './store/index'
import {path2Array} from "@amap/amap-react/es/utils/convert";

const {  Sider, Content } = Layout;


// const unsubscribe = store.subscribe(() =>
//   console.log('State after dispatch: ', store.getState().pointEditor[0])
// )
const URLType = {
  "MATCH_ROUTE" : 0,
  "CONVERT_POINT" : 1
}
export default function App() {
  const [pathArray, setpathArray] = useState([
    [
      120.585008,
      28.088507
    ],
  ]);
  function locParser(position) {
    let res = position.split(';');
    res = res.map((x)=>{
      let newPos = x.split(',');
      newPos[0] = parseFloat(newPos[0])
      newPos[1] = parseFloat(newPos[1])
      return newPos;
    });
    return res;
  }
  function sortArray() {
    let res = [];
    let temp = {};
    const pointList = store.getState().pointEditor;
    pointList.map(item=>{
      if(!temp[item.cid]) {
        res.push([[item.lon, item.lat]]);
        temp[item.cid] = item.cid;
      }
      else {
        res[res.length-1] = [...res[res.length-1],[item.lon, item.lat]];
      }
      return item;
    })
    getWaypointsArray(res[0]);
  }

  function urlGenerator(type, start_i, Array){
    let URL;
    switch (type){
      case URLType.CONVERT_POINT:
        URL = "https://restapi.amap.com/v3/assistant/coordinate/convert?locations="
        Array.slice(start_i, start_i + 40).map((item,idx)=>{
          URL += item[0] + ',' + item[1];
          if (idx !=  39){
            URL +='|';
          }
        })
        URL+="&coordsys=gps&key=7f8f5883aa922c1463b2710e97989156"
        return URL;
      case URLType.MATCH_ROUTE:
        URL="http://router.project-osrm.org/match/v1/car/"
        Array.slice(start_i, start_i + 100).map((item,idx)=>{
          URL += item[0] + ',' + item[1];
          if (idx != 99){
            URL +=';';
          }
        })
        URL += "?geometries=geojson&overview=full&tidy=true";
        return URL;
      default:
        return '';
    }
  }
  async function getWaypointsArray(pathArray){

    var res = []
    let i = 0, j = 0;
    while (i + 100 < pathArray.length) {
      let URL = urlGenerator(URLType.MATCH_ROUTE, i, pathArray);
      await fetch(URL, {
        method: 'GET',
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
          myJson.matchings.map(x=>{
            res = [...res, ...x.geometry.coordinates];
          })
        });
      i += 100;
    }
    var pathAfterConvert = []
    while(j + 40 < res.length){
      let URL = urlGenerator(URLType.CONVERT_POINT, j, res);
      await fetch(URL, {
        method: 'GET',
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
          pathAfterConvert = [...pathAfterConvert, locParser(myJson.locations)];
        });
      j += 40;
    }
    setpathArray(pathAfterConvert);
  }
  function getFormatLocationArray(waypoints){
    let res = []
    waypoints.map(item=>{
      if (item && item.location)
        res.push(item.location)
    })
    return res;
  }
  return (
    <div className="App">
      <Layout style={{height:'100%'}}>
        <Content>
          <div className="map-container">
            <Amap zoom={15} center={[120.631, 27.9736]}>
              <PolylineEditor enabled={false} onChange={target => {setpathArray(path2Array(target.getPath()))}}>
                <Polyline
                  path={pathArray}
                  strokeColor="red"
                  showDir={true}
                  strokeWeight={6}
                />
              </PolylineEditor>
            </Amap>
          </div>
        </Content>
        <Sider style={{width:'100%',height:'100%'}}>
          <Row type='flex' justify='center' align='middle' style={{height:'100%'}}>
            <Upload
              accept=".txt, .csv"
              showUploadList={false}
              beforeUpload={file => {
                Papa.parse(file, {
                  header: true,
                  dynamicTyping: true,
                  step: function(row) {
                    store.dispatch(addcarPoint(row.data))
                  },
                  complete: async function() {
                    await sortArray();
                  }
                });
              }}
            >
              <Button icon={<UploadOutlined />}>
                Click to Upload
              </Button>
            </Upload>;
          </Row>
        </Sider>
      </Layout>
    </div>
  );
}
