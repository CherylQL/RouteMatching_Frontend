import React, {useState} from "react";
import "./App.css";
import { Amap, PolylineEditor, Polyline } from "@amap/amap-react";
import Papa from 'papaparse';
import {Layout, Button, Upload, Row} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { addcarPoint } from './store/action/index';
import { store } from './store/index'
import {path2Array} from "@amap/amap-react/es/utils/convert";

const {  Sider, Content } = Layout;

console.log('Initial state: ', store.getState())

// const unsubscribe = store.subscribe(() =>
//   console.log('State after dispatch: ', store.getState().pointEditor[0])
// )
export default function App() {
  const [pathArray, setpathArray] = useState([
    [
      120.585008,
      28.088507
    ],
    // [
    //   120.584518,
    //   28.084903
    // ],
    // [
    //   120.584518,
    //   28.084903
    // ],
    // [
    //   120.618367,
    //   28.022355
    // ]
  ]);
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
    console.log(res);
    setpathArray(res[0]);
  }
  return (
    <div className="App">
      <Layout style={{height:'100%'}}>
        <Content>
          <div className="map-container">
            <Amap zoom={15} center={[120.627, 27.9769]}>
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
                    // unsubscribe()
                    // console.log("Row:", row.data);
                  },
                  complete: function() {
                    console.log('load Complete!');
                    sortArray();
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
