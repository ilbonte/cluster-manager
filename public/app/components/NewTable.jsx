import React from 'react';
import ReactDOM from 'react-dom';
import Accordion from 'react-bootstrap/lib/Accordion';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Grid from 'react-bootstrap/lib/Grid';
import Modal from 'react-bootstrap/lib/Modal';
import Panel from 'react-bootstrap/lib/Panel';
import Row from 'react-bootstrap/lib/Row';
import Well from 'react-bootstrap/lib/Well';
/////////////////////////////////////////////////
import ModalContent from './ModalContent';
///////////////////////////////////////////////
import Inspector from 'react-inspector';
import io from 'socket.io-client/socket.io';
import {baseUrl} from '../lib';
const _ = require('lodash/core');
const xhr = require('xhr');
////////////////////////////////////////////////
const actionButtonSize='xsmall';

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
            let data = this.state.data.slice();
            var i;
            for (i = 0; i < data.length; i++) {
                if (data[i].uid === payload.uid) {
                    break;
                }
            }
            if(data[i]){
              if(!data[i].log){//fix undefined as first
                data[i].log=payload.log;
              }else{
                data[i].log += payload.log;
              }

              this.setState({data});
            }
        });

    }

    render() {
        const {title} = this.props;
        let rowNodes = this.state.data.map((item) => {
            return (<TableRow data={item} key={item.uid} getData={this.getData}/>);
        });
        // console.log(rowNodes);
        let headerContent = null;
        if (title.toLowerCase() === 'images') {
            headerContent = <Row>
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
                        <ModalContent type={this.state.selectedType} onHide={this.close} getData={this.getData}/>
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
                        <TableCell>Type</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableHeader>
                    {rowNodes}
                </Panel>
            </div>
        );
    }

    getData = () => {
      console.log('getting data');
        xhr({
            uri: baseUrl + this.props.getUrl
        }, (err, resp, body) => {
            // check resp.statusCode
            if (resp.statusCode === 200) {
                this.setState({data: JSON.parse(body)});
                // console.log(resp);

            } else {
                console.log('Error getting data');
                console.log(err);
            }
        });
    }

    close = () => {
        this.setState({showModal: false});
    }

    open = () => {
        this.setState({showModal: true});
    }
    setSelectedType = (type) => {
        this.setState({selectedType: type});
        this.open();
    }

}

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------

class TableHeader extends React.Component {
    render() {
        let headerStyle = {
            background: '#ea6153',
            color: 'white',
            fontWeight: '900'
        }
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
        let headerStyle = {}
        let {type, name, status, uid, log} = this.props.data;
        let build = '';
        let buildLog = '';
        let inspection;

        if (type === 'docker') {
            if (name) {

                name += ':' + this.props.data.tag;
                inspection = this.props.data.inspect || {};

                this.props.data.config.build.forEach(step => {
                    build += step.instruction + ' ' + step.arguments + '\n';
                });
                if (log) {

                  if(_.isString(log)){
                    //streaming
                      buildLog+=log;
                  }else{
                    // /if reading from db
                    log.forEach(step => {
                      buildLog += JSON.stringify(step,null,2) + '\n';
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
        }
        return (
            <div>
                <Row style={headerStyle} onClick={(event) => {if(event.target.textContent) this.setState({
                    open: !this.state.open
                })}}>
                    <TableCell>{type}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell id='ignoreExpansion' onClick={() => this.setState({
                        open: false
                    })}><ActionsButtons data={this.props.data} getData={this.props.getData}/></TableCell>
                </Row>
                <Row>
                    <Collapse in={this.state.open}>
                        <div>
                            <Col xs={6}>
                                <h3>Build Steps</h3>
                                <pre style={{maxHeight:'300px'}}>{build}</pre>
                            </Col>
                            <Col xs={12}>
                                <h3>Build log</h3>
                                <Scroller >{buildLog}</Scroller>
                            </Col>
                            <Col xs={12}>
                                <h3>Image Inspect Details</h3>
                                <Inspector expandLevel={0} data={inspection}/>
                            </Col>
                        </div>
                    </Collapse>
                </Row>
            </div>
        );
    }
}

class Scroller extends React.Component{
  componentDidMount(){
    // let DOMNode=ReactDOM.findDOMNode(this);
    // console.log(DOMNode);
    // DOMNode.scrollTop = 10000; //scrollHeight
    // console.log(DOMNode.scrollTop);
  }
  render(){
    return <pre style={{maxHeight:'100px'}}>{this.props.children}</pre>
  }
}
class ActionsButtons extends React.Component{

  render(){
    let {type,name,status} = this.props.data;
    let buttons=[];

    let deleteButton = <DeleteButton key={1} data={this.props.data} getData={this.props.getData}/>;
    let editButton = <Button  bsSize={actionButtonSize}><Glyphicon glyph="wrench" key={2}/></Button>;
    let duplicateButton = <Button bsStyle="info" bsSize={actionButtonSize}><Glyphicon glyph="duplicate" key={3}/></Button>;
    let runButton = <Button bsStyle="success" bsSize={actionButtonSize}><Glyphicon glyph="send" key={4}/></Button>;

    switch (status) {
      case 'saved':
      //saved=duplicate|edit|delete
        buttons.push(duplicateButton);
        buttons.push(editButton);
        buttons.push(deleteButton);
        break;
      case 'saved+builded':
      //builded=run|duplicate|edit|delete
      buttons.push(runButton);
      buttons.push(duplicateButton);
      buttons.push(editButton);
      buttons.push(deleteButton);

        break;
      case 'builded':
      //builded=run|duplicate|edit|delete

        break;
      case 'failed':
      //failed=duplicate|edit|delete
      buttons.push(duplicateButton);
      buttons.push(editButton);
      buttons.push(deleteButton);
        break;
      default:

    }


    return <ButtonGroup>{buttons}</ButtonGroup>
  }
}

class DeleteButton extends React.Component {
    render() {
        let cellStyle = {
            border: '1px solid black'
        }
        return (
            <Button bsStyle="danger" bsSize={actionButtonSize}><Glyphicon glyph="trash" onClick={this.sendDelete} /></Button>
        );
    }
    sendDelete  = (event) =>{
      xhr({

          method: 'DELETE',
          uri: baseUrl + '/v1/images/'+this.props.data.uid

      }, (err, resp, body) => {
        this.props.getData();
        console.log('asdasd');

          if (resp.statusCode === 200) {
              // this.setState({data: JSON.parse(body)});

          } else {
              console.log('Error posting new image');
              console.log(err);
          }
      })
      console.log(this.props.data);

    }
}
class TableCell extends React.Component {
    render() {
        let cellStyle = {
            border: '1px solid black'
        }
        return (
            <Col xs={3} style={cellStyle}>{this.props.children}</Col>
        );
    }
}
export default NewTable;
