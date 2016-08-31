import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Modal from 'react-bootstrap/lib/Modal';
import Panel from 'react-bootstrap/lib/Panel';
import Row from 'react-bootstrap/lib/Row';
import ModalContent from './ModalContent';
import ActionsButtons from './ActionsButtons';
import Inspector from 'react-inspector';
import io from 'socket.io-client/socket.io';
import {baseUrl, generateUid} from '../lib';
/////////////////////////////////////////////////
/////////////////////////////////////////////
const _ = require('lodash/core');
const xhr = require('xhr');
////////////////////////////////////////////////


let socket = io.connect(baseUrl);

const dockerTemplate = {
  type: 'docker',
  fields: {
    name: {
      type: 'string',
      required: 'true'
    }
  }
};
const vagrantTemplate = {
  type: 'vagrant',
  fields: {
    name: {
      type: 'string',
      required: 'true'
    }
  }
};

class NewTable extends React.Component {
  constructor() {
    super();
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    this.getData();
    socket.on('refresh', () => this.getData());
    socket.on('streamLog', payload => {
      this.updateRow(payload);
    });

  }

  updateRow(payload) {
    let data = this.state.data.slice();
    var line;
    for (line = 0; line < data.length; line++) {
      if (data[line].uid === payload.uid) {
        break;
      }
    }
    if (data[line]) {
      if (!data[line].log) { //fix undefined as first
        data[line].log = payload.log;
      } else {
        data[line].log += payload.log;
      }

      this.setState({data});
    }
  }

  render() {
    const {title} = this.props;
    let rowNodes = this.generateTableRows();
    let headerContent = null;

    if (title.toLowerCase() === 'images') {
      headerContent =
        <Row>
          <Col xs={6}>
            <h3>{title}</h3>
          </Col>
          <Col xs={6}>
            <ButtonToolbar style={{
              float: 'right'
            }}>
              <Button bsStyle="success" onClick={this.setSelectedType.bind(this, 'docker')}><Glyphicon glyph="plus"/>
                Docker</Button>
              <Button bsStyle="success" onClick={this.setSelectedType.bind(this, 'vagrant')}><Glyphicon glyph="plus"/>
                Vagrant</Button>

            </ButtonToolbar>
            <Modal show={this.state.showModal} onHide={this.close} bsSize='lg'>
              <Modal.Header closeButton>
                <Modal.Title>Configure your image</Modal.Title>
              </Modal.Header>
              <ModalContent type={this.state.selectedType} onHide={this.close} getData={this.getData}
                            itemData={this.state.itemData}
                            data={this.state.data.filter(item => item.type === 'docker' && (item.status === 'saved+builded' || item.status === 'saved'))}/>
            </Modal>
          </Col>
        </Row>
    } else {
      headerContent = <Row>
        <Col xs={6}>
          <h3>{title}</h3>
        </Col>
      </Row>
    }
    return (
      <div>
        <Panel header={headerContent} bsStyle='info'>
          <TableHeader>
            <TableCell col={2}>Type</TableCell>
            <TableCell col={4}>Name</TableCell>
            <TableCell col={3}>Status</TableCell>
            <TableCell col={3}>Actions</TableCell>
          </TableHeader>
          {rowNodes}
        </Panel>
      </div>
    );
  }

  generateTableRows() {
    return this.state.data.map((item) => {
      return (<TableRow title={this.props.title} data={item} key={item.uid || generateUid()} getData={this.getData}
                        open={this.open}/>);
    });
  }

  getData = () => {
    console.log('getting data');
    xhr({
      uri: baseUrl + this.props.getUrl
    }, (err, resp, body) => {
      if (resp.statusCode === 200) {
        console.log(JSON.parse(body));
        this.setState({data: JSON.parse(body)});
      } else {
        console.log('Error getting data');
        console.log(err);
      }
    });
  };

  close = () => {
    this.setState({itemData: false});
    this.setState({showModal: false});
  };

  open = (itemData) => {
    if (itemData) {
      console.log(itemData);
      this.setState({selectedType: itemData.type});
      this.setState({itemData});
    }
    this.setState({showModal: true});
  };
  setSelectedType = (type) => {
    this.setState({selectedType: type});
    this.open();
  }

}

class TableHeader extends React.Component {
  render() {
    let headerStyle = {
      background: '#ea6153',
      color: 'white',
      fontWeight: '900'
    };

    return (
      <Row style={headerStyle}>{this.props.children}</Row>
    );
  }
}

class TableRow extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    let headerStyle = {};
    let {type, name, status, uid, log} = this.props.data;
    let build = '';
    let buildLog = '';
    let inspection = {};
    let expandedRowContent;
    let icon;
    //if (type === 'docker') { icon = <img src="https://www.docker.com/favicons/favicon-32x32.png">; }else{ icon = <img src="https://www.vagrantup.com/assets/images/favicon-d7af32eb.png">; }
    if (type === 'docker') {
      icon = (<img src="http://2.bp.blogspot.com/-7mObhiF1oQU/Vesm1knXbkI/AAAAAAAADzo/ka_mfLsOBDw/s1600/docker.png" alt="docker" className="typeIcon"/>);
    } else {
      icon = (
        <img src="https://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2014/11/1415685451vagrant-1.png" alt="vagrant" className="typeIcon"/>);

    }

    if (this.props.title === 'Images') {
      if (type === 'docker') {
        const __ret = this.generateDockerRows(name, inspection, build, log, buildLog);
        name = __ret.name;
        inspection = __ret.inspection;
        build = __ret.build;
        buildLog = __ret.buildLog;
        expandedRowContent = (<div><Col xs={6}>
          <h3>Build Steps</h3>
          <pre style={{maxHeight: '300px'}}>{build}</pre>
        </Col>
          <Col xs={12}>
            <h3>Build log</h3>
            <Scroller >{buildLog}</Scroller>
          </Col>
          <Col xs={12}>
            <h3>Image Inspect Details</h3>
            <Inspector expandLevel={0} data={inspection}/>
          </Col></div>);
      }
    } else if (this.props.title === 'Instances') {
      console.log('instance', this.props.data);
      name = this.props.data.runConfig.name;
    }


    return (
      <div>
        <Row style={headerStyle} onClick={(event) => {
          if (event.target.textContent)
            this.setState({
              open: !this.state.open
            })
        }}>
          <TableCell col={2}>{icon}</TableCell>
          <TableCell col={4}>{name}</TableCell>
          <TableCell col={3}>{status}</TableCell>
          <TableCell col={3} id='ignoreExpansion' onClick={() => this.setState({open: false})}>
            <ActionsButtons title={this.props.title} data={this.props.data} getData={this.props.getData}
                            open={this.props.open}/>
          </TableCell>
        </Row>
        <Row>
          <Collapse in={this.state.open}>
            <div>
              {expandedRowContent}
            </div>
          </Collapse>
        </Row>
      </div>
    );
  }

  generateDockerRows(name, inspection, build, log, buildLog) {
    if (name) {
      name += ':' + this.props.data.tag;
      inspection = this.props.data.inspect || {};

      this.props.data.config.build.forEach(step => {
        build += step.instruction + ' ' + step.arguments + '\n';
      });

      if (log) {
        if (_.isString(log)) {
          //streaming
          buildLog += log;
        } else {
          // /if reading from db
          log.forEach(step => {
            buildLog += JSON.stringify(step, null, 2) + '\n';
          })

        }
      }
    } else {
      //only online
      inspection = this.props.data;
      name = '';
      this.props.data.RepoTags.forEach(imageName => {
        name += imageName + ' || '
      });
    }
    return {name: name, inspection: inspection, build: build, buildLog: buildLog};
  }
}

class Scroller extends React.Component {
  componentDidMount() {
    // let DOMNode=ReactDOM.findDOMNode(this);
    // console.log(DOMNode);
    // DOMNode.scrollTop = 10000; //scrollHeight
    // console.log(DOMNode.scrollTop);
  }

  render() {
    return <pre style={{maxHeight: '300px'}}>{this.props.children}</pre>
  }
}

class TableCell extends React.Component {
  render() {
    let cellStyle = {
      borderTop: '1px solid black'
    };
    // cellStyle={};
    return (
      <Col xs={this.props.col} style={cellStyle}>{this.props.children}</Col>
    );
  }
}
export default NewTable;
