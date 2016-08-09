import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {baseUrl} from '../lib';
const xhr = require('xhr');
//////////
const actionButtonSize = 'xsmall';
export default class ActionsButtons extends React.Component {

  render() {
    let {type, name, status} = this.props.data;
    let buttons = [];

    let deleteButton = <DeleteButton title={this.props.title} key={100} data={this.props.data}
                                     getData={this.props.getData}/>;
    let editButton = <Button key={200} bsSize={actionButtonSize} onClick={this.edit}><Glyphicon
      glyph="wrench"/></Button>;
    let duplicateButton = <DuplicateButton key={300} data={this.props.data} open={this.props.open}/>;
    let runButton = <RunButton key={400} data={this.props.data} getData={this.props.getData}/>;
    let pauseButton = <PauseButton key={500} data={this.props.data} getData={this.props.getData}/>;
    let startButton = <StartButton key={600} data={this.props.data} getData={this.props.getData}/>;
    let poweroffButton = <PoweroffButton key={700} data={this.props.data} getData={this.props.getData}/>;

    switch (status) {
      case 'saved':
        //saved=duplicate|edit|delete
        buttons.push(duplicateButton);
        buttons.push(editButton);
        buttons.push(deleteButton);
        break;
      case 'saved+builded':
        //saved+builded=run|duplicate|edit|delete
        buttons.push(runButton);
        buttons.push(duplicateButton);
        buttons.push(editButton);
        buttons.push(deleteButton);

        break;
      case 'saved+running':
        //stop|delete
        buttons.push(deleteButton);
        buttons.push(pauseButton);
        if(type==='vagrant'){
          buttons.push(poweroffButton);
        }

        break;
      // case 'poweroff':
      //   //start|delete
      //   buttons.push(deleteButton);
      //   break;
      case 'saved+poweroff':
        //start|delete
        buttons.push(deleteButton);
        buttons.push(startButton);
        break;
      case 'saved+saved':
        buttons.push(deleteButton);
        buttons.push(startButton);
        break;
      case 'saved+exited':
        //start??|delete
        buttons.push(deleteButton);
        buttons.push(startButton);
        break;
      case 'builded':
        //builded=|delete
        if (this.props.data.RepoTags) {
          if (this.props.data.RepoTags.length === 1) {
            buttons.push(deleteButton);
          }

        }
        break;
      case 'failed':
        //failed=duplicate|edit|delete
        buttons.push(duplicateButton);
        buttons.push(editButton);
        buttons.push(deleteButton);
        break;

    }

    return <ButtonGroup>{buttons}</ButtonGroup>
  }

  edit = () => {
    console.log('edit');
    this.props.data._action = 'edit';
    this.props.open(this.props.data);
  }
}

class DeleteButton extends React.Component {
  render() {

    return (
      <Button bsStyle="danger" bsSize={actionButtonSize}><Glyphicon glyph="trash" onClick={this.sendDelete.bind(this, this.props.title)}/></Button>
    );
  }

  sendDelete = (title) => {
    let json = {};
    if (this.props.data.RepoTags) {
      //if only builded
      if (this.props.data.RepoTags.length === 1) {
        json.name = this.props.data.RepoTags[0];
      }
    }
    xhr({
      json,
      method: 'DELETE',
      uri: baseUrl + '/v1/' + title.toLowerCase() + '/' + this.props.data.uid

    }, (err, resp, body) => {
      this.props.getData();

      if (resp.statusCode === 200) {
        // this.setState({data: JSON.parse(body)});

      } else {
        console.log('Error deleting');
        console.log(err);
      }
    })

  }
}

class DuplicateButton extends React.Component {
  duplicate = () => {
    this.props.data._action = 'duplicate';
    this.props.open(this.props.data);
  };

  render() {
    let cellStyle = {
      border: '1px solid black'
    };
    return (
      <Button bsStyle="info" bsSize={actionButtonSize} onClick={this.duplicate}><Glyphicon glyph="duplicate"
                                                                                           key={3}/></Button>
    );
  }
}
class RunButton extends React.Component {

  constructor() {
    super();
    this.state = {};

  }

  close = () => {
    this.setState({showModal: false});
  };

  open = () => {
    this.setState({showModal: true});
  };

  handleFieldChange = (field, event) => {
    this.setState({[field]: event.target.value});
  };

  startInstance = () => {
    this.setState({showModal: true});
    let json = {};
    if (this.props.data.type === 'docker') {
      json = {
        name: this.state.name,
        hostIp: this.state.hostIP,
        hostPort: this.state.hostPort,
        containerPort: this.state.containerPort,
        protocol: this.state.protocol
      }
    } else if (this.props.data.type === 'vagrant') {
      console.log(this.props.data);
      json = {
        name: this.state.name,
        imageName: this.props.data.name
      }
    }
    xhr({
      json,
      method: 'post',
      uri: baseUrl + '/v1/instances/new' + '?uid=' + this.props.data.uid

    }, (err, resp, body) => {
      this.props.getData();

      if (resp.statusCode === 200) {
        // this.setState({data: JSON.parse(body)});

      } else {
        console.log('Error posting new image');
        console.log(err);
      }
    });
    this.close();
  };

  isDisabled() {
    if (this.state.name !== undefined) {
      return this.state.name <= 0;
    }
    return true;
  }

  render() {

    let networkForm = undefined;

    if (this.props.data.type === 'docker') {
      networkForm = <Form inline> <ControlLabel>PortBindings:</ControlLabel>
        {
          ' '
        } < FormControl type="text" placeholder="Host IP Address" size="8" onChange={
          this.handleFieldChange.bind(this, 'hostIP')
        }/>< FormControl type="text" placeholder="Host Port" size="8" onChange={
          this.handleFieldChange.bind(this, 'hostPort')
        }/>< FormControl type="text" placeholder="Container Port" size="8" onChange={
          this.handleFieldChange.bind(this, 'containerPort')
        }/> <FormControl componentClass="select" onChange={this.handleFieldChange.bind(this, 'protocol')}>
          <option value="">both</option>
          <option value="tcp">tcp</option>
          <option value="udp">udp</option>
        </FormControl> </Form>
    }

    return (
      <Button bsStyle="success" bsSize={actionButtonSize}> <Glyphicon glyph="send" onClick={this.open}/>
        <Modal show={
          this.state.showModal
        } onHide={
          this.close
        }>

          <Modal.Body>
            <Form inline>
              <ControlLabel>Container name</ControlLabel>
              {' '}
              <FormControl type="text" placeholder="name" size="8"
                           onChange={this.handleFieldChange.bind(this, 'name')}/>
            </Form>
            {networkForm}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.startInstance} disabled={this.isDisabled()}>Start</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Button>)
  }
}

class PauseButton extends React.Component {
  pause = () => {
    const json={action:'pause'};
    xhr({
      json,
      method: 'put',
      uri: baseUrl + '/v1/instances/' + this.props.data.uid

    }, (err, resp, body) => {
      this.props.getData();

      if (resp.statusCode === 200) {
        // this.setState({data: JSON.parse(body)});

      } else {
        console.log('Error updating instance');
        console.log(err);
      }
    });
  };

  render() {
    return (
      <Button bsStyle="info" bsSize={actionButtonSize} onClick={this.pause}><Glyphicon glyph="pause" key={4}/></Button>
    );
  }
}

class StartButton extends React.Component {
  resume = () => {
    const json={action:'start'};
    if(this.props.data.status==='saved+poweroff'){
      json.action='up';
    }
    xhr({
      json,
      method: 'put',
      uri: baseUrl + '/v1/instances/' + this.props.data.uid

    }, (err, resp, body) => {
      this.props.getData();

      if (resp.statusCode === 200) {
        // this.setState({data: JSON.parse(body)});

      } else {
        console.log('Error updating instance');
        console.log(err);
      }
    });
  };

  render() {
    return (
      <Button bsStyle="info" bsSize={actionButtonSize} onClick={this.resume}><Glyphicon glyph="play" key={5}/></Button>
    );
  }
}
class PoweroffButton extends React.Component {
  resume = () => {
    const json={action:'poweroff'};
    xhr({
      json,
      method: 'put',
      uri: baseUrl + '/v1/instances/' + this.props.data.uid

    }, (err, resp, body) => {
      this.props.getData();

      if (resp.statusCode === 200) {
        // this.setState({data: JSON.parse(body)});

      } else {
        console.log('Error updating instance');
        console.log(err);
      }
    });
  };

  render() {
    return (
      <Button bsStyle="info" bsSize={actionButtonSize} onClick={this.resume}><Glyphicon glyph="off" key={6}/></Button>
    );
  }
}
