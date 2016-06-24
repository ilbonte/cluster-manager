import React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import NewTable from './NewTable.jsx';
import io from 'socket.io-client/socket.io';
import {generateUid,baseUrl} from '../lib';
let socket = io.connect(baseUrl);
export default class App extends React.Component {
  componentDidMount(){
    if(! localStorage.getItem('userUid')){
      localStorage.setItem('userUid', generateUid());
    }
    socket.emit('handshake', localStorage.getItem('userUid'));
    socket.on('handshake', (data) => {
      console.log('hs:');
        // localStorage.setItem('success', data.success);
        console.log(data);
    });
    socket.on('stream', (data) => {
      console.log(data);
    });
  }
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <div>
        <Grid fluid={true}>
          <Row>
            <Col sm={6}>
              <NewTable title={'Images'} getUrl={'/v1/images'}/>
            </Col>
            <Col sm={6}>
              <NewTable title={'Instances'} getUrl={'/v1/instances'}/>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
