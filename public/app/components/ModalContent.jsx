import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';
import Accordion from 'react-bootstrap/lib/Accordion';
import Autocomplete from 'react-autocomplete';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Modal from 'react-bootstrap/lib/Modal';
import Panel from 'react-bootstrap/lib/Panel';
import Row from 'react-bootstrap/lib/Row';
import Table from 'react-bootstrap/lib/Table';
import {baseUrl} from '../lib';
///////////////////////////////////////
let validateDockerfile = require('validate-dockerfile');
const xhr = require('xhr');
var Dropzone = require('react-dropzone');
////////////////
function matchStateToTerm(state, value) {
  return (state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
}
const dockerfile = [
  {
    name: 'FROM'
  }, {
    name: 'MAINTAINER'
  }, {
    name: 'RUN'
  }, {
    name: 'CMD'
  }, {
    name: 'LABEL'
  }, {
    name: 'EXPOSE'
  }, {
    name: 'ENV'
  }, {
    name: 'ADD'
  }, {
    name: 'COPY'
  }, {
    name: 'ENTRYPOINT'
  }, {
    name: 'VOLUME'
  }, {
    name: 'USER'
  }, {
    name: 'WORKDIR'
  }, {
    name: 'ARG'
  }, {
    name: 'ONBUILD'
  }, {
    name: 'STOPSIGNAL'
  }
];
const vagrantConfig = {
  forwarded_port: [
    {
      name: 'guest'
    }, {
      name: 'guest_ip'
    }, {
      name: 'host'
    }, {
      name: 'host_ip'
    }, {
      name: 'protocol'
    }, {
      name: 'auto_correct'
    }
  ],
  private_network: [
    {
      name: 'type'
    }, {
      name: 'ip'
    }, {
      name: 'netmask'
    }, {
      name: 'auto_config'
    }
  ],
  public_network: [
    {
      name: 'use_dhcp_assigned_default_route'
    }, {
      name: 'ip'
    }, {
      name: 'bridge'
    }, {
      name: 'auto_config'
    }
  ]
};
const autocompleteStyles = {
  item: {
    padding: '2px 6px',
    cursor: 'default'
  },
  highlightedItem: {
    color: '#98978b',
    background: '#f8f5f0',
    padding: '2px 6px',
    cursor: 'default'
  },
  menu: {
    borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%',
    zIndex: '1'
  }
};

export default class ModalContent extends React.Component {
  constructor(props) {
    super(props);
    if (this.isEditing()) {
      //get the build steps
      if (this.props.type === 'docker') {
        this.state = {
          rows: this.props.itemData.config.build,
          tag: this.props.itemData.tag,
          name: this.props.itemData.name
        }
      } else {
        this.state = this.props.itemData.oldState;
      }
    } else {
      //empty/new image creation
      this.state = {
        rows: [
          {
            instruction: '',
            arguments: ''
          }
        ],
        networkRows: [
          {
            instruction: '',
            arguments: ''
          }
        ]
      };
    }
  }

  isEditing() {
    return this.props.itemData;
  }

  render() {
    return (
      <div>
        <Modal.Body >
          {this.createForm()}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.saveAndBuild} bsStyle='success' disabled={this.isDisabled()}>Save and Build</Button>
          <Button onClick={this.props.onHide} bsStyle='danger'>Close</Button>
          <Button onClick={()=> {
          }} bsStyle='danger'>DEBUG</Button>
        </Modal.Footer>
      </div>
    )
  }

  componentDidMount() {
    if (this.props.type === 'docker') {
      this.updateStateElement('rows', 'FROM', 0, 'instruction');
    }
  }

  createForm() {
    console.log(this.state);
    if (this.props.type === 'docker') {
      return this.createDockerForm();
    } else if (this.props.type === 'vagrant') {
      return this.createVagrantForm();
    }
  }

  removeStateElement = (elem, index) => {
    var rows = this.state[elem].slice();
    if (rows.length > 1) {
      rows.splice(index, 1);
    }
    this.setState({[elem]: rows});
  };

  addStateElement = (elem, index) => {
    let rows = this.state[elem].slice();
    console.log(rows);
    rows.splice(index + 1, 0, {
      instruction: '',
      arguments: ''
    });
    this.setState({[elem]: rows});
  };

  updateStateElement = (elem, value, index, field) => {
    let rows = this.state[elem].slice();
    rows[index][field] = value;
    this.setState({[elem]: rows})
  };

  handleFieldChange = (field, event) => {
    this.setState({[field]: event.target.value});
  };

  printDockerfile = (configs) => {
    let dockerString = '';
    configs.forEach((item) => {
      dockerString += item.instruction + ' ' + item.arguments + ' \n';
    });
    return dockerString;
  };

  getValidationState(field) {
    if (this.state[field]) {
      if (this.state[field].length > 0) return 'success';
    }
    return 'error'
  }

  createDockerForm() {
    var rowNodes = this.generateDockerTableRows();

    let content = (
      <Row>
        <Col xs={6}>
          <Table striped bordered condensed hover>
            <thead>
            <tr>
              <th>#</th>
              <th>INSTRUCTION</th>
              <th>arguments</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {rowNodes}
            </tbody>
          </Table>
        </Col>
        <Col xs={6}>
          <FormControl disabled="disabled" rows={this.state.rows.length * 2} style={{
            padding: '1px'
          }} componentClass="textarea" value={this.printDockerfile(this.state.rows)}/>
          <ErrorsBox dockerfile={this.printDockerfile(this.state.rows)}/>
        </Col>
        <Col xs={12}>
          <Accordion>
            <Panel header="Start options">
              <Row>
                <Col xs={12}>
                  <Form inline>
                    <FormGroup validationState={this.getValidationState('name')}>
                      <ControlLabel>Tag Image:</ControlLabel>
                      {' '}
                      <FormControl type="text" placeholder="name" size="8"
                                   onChange={this.handleFieldChange.bind(this, 'name')} value={this.state.name}
                      />
                    </FormGroup>
                    <FormGroup validationState={this.getValidationState('tag')}>
                      < FormControl type="text"
                                    placeholder="tag"
                                    size="8"
                                    onChange={this.handleFieldChange.bind(this, 'tag')} value={this.state.tag}/>
                    </FormGroup>
                  </Form>
                </Col>

              </Row>
            </Panel>
          </Accordion>
        </Col>
      </Row>

    );
    return (content);
  }

  generateDockerTableRows() {
    return this.state.rows.map((item, index) => {
      return (
        <tr key={index}>
          <td>{index}</td>
          <td>
            <Autocomplete inputProps={{
              size: '10'
            }} menuStyle={autocompleteStyles.menu} value={this.state.rows[index].instruction} items={dockerfile}
                          getItemValue={(item) => item.name} shouldItemRender={matchStateToTerm}
                          onChange={(event) => {
                            this.updateStateElement('rows', event.target.value, index, 'instruction');
                          }} onSelect={(value) => {
              this.updateStateElement('rows', value, index, 'instruction');
            }} renderItem={(item, isHighlighted) => (
              <div style={isHighlighted
                ? autocompleteStyles.highlightedItem
                : autocompleteStyles.item} key={item.name}>{item.name}
                <a href={'https://docs.docker.com/engine/reference/builder/#' + item.name.toLowerCase()}
                   target='_blank'>{' '}
                  #</a>
              </div>
            )}/>
          </td>
          <td>
            <FormControl value={this.state.rows[index].arguments} style={{
              padding: '1px'
            }} componentClass="textarea" onChange={(event) => {
              this.updateStateElement('rows', event.target.value, index, 'arguments');
            }}/>

          </td>
          <td>
            <ButtonGroup>
              <Button bsStyle="success" bsSize="small"
                      onClick={this.addStateElement.bind(null, 'rows', index)}><Glyphicon glyph="plus"/></Button>
              <Button bsStyle="danger" bsSize="small"
                      onClick={this.removeStateElement.bind(null, 'rows', index)}><Glyphicon glyph="trash"/>
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      );
    });
  }

  createVagrantForm() {

    var networkNodes = this.state.networkRows.map((item, index) => {
      return (
        <tr key={index}>
          <td>
            <Autocomplete inputProps={{
              size: '10'
            }} menuStyle={autocompleteStyles.menu} value={this.state.networkRows[index].instruction}
                          items={vagrantConfig[this.state.networkType] || {name: ''}} getItemValue={(item) => item.name}
                          shouldItemRender={matchStateToTerm} onChange={(event) => {
              this.updateStateElement('networkRows', event.target.value, index, 'instruction');
            }} onSelect={(value) => {
              this.updateStateElement('networkRows', value, index, 'instruction');
            }} renderItem={(item, isHighlighted) => (
              <div style={isHighlighted
                ? autocompleteStyles.highlightedItem
                : autocompleteStyles.item} key={item.name}>{item.name}
              </div>
            )}/>
          </td>
          <td>
            <FormControl value={this.state.networkRows[index].arguments} style={{
              padding: '1px'
            }} componentClass="textarea" onChange={(event) => {
              this.updateStateElement('networkRows', event.target.value, index, 'arguments');
            }}/>

          </td>
          <td>
            <ButtonGroup>
              <Button bsStyle="success" bsSize="small"
                      onClick={this.addStateElement.bind(null, 'networkRows', index)}><Glyphicon glyph="plus"/></Button>
              <Button bsStyle="danger" bsSize="small"
                      onClick={this.removeStateElement.bind(null, 'networkRows', index)}><Glyphicon glyph="trash"/>
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      );
    });
    let errorBox = undefined;
    let sidePanel = undefined;
    let savedDockerfile = undefined;
    let dropzone = undefined;
    let fullDropzone = (
      <div style={{
        border: '1px dashed lightgray'
      }}>
        <Dropzone onDrop={this.onDrop} style={{
          width: '100%',
          height: '100px'
        }}>
          <div>Click to select or drop file here</div>
        </Dropzone>
      </div>
    );

    let dockerBuildFooter = undefined;
    switch (this.state.provisioning) {
      case 'docker': {
        dropzone = fullDropzone;
        errorBox = <ErrorsBox dockerfile={this.state.script}/>;
        let optionNodes = this.props.data.map((item, index) => <option value={index}
                                                                       key={index}>{item.name + ':' + item.tag}
        </option>);
        savedDockerfile = <FormGroup>
          <ControlLabel>Select from saved</ControlLabel>
          <FormControl componentClass="select" placeholder="select" onChange={(event) => {
            this.setState({
              script: this.printDockerfile(this.props.data[event.target.value].config.build)
            });
          }}>
            <option value="">Select</option>
            {optionNodes}
          </FormControl>
        </FormGroup>;
        sidePanel = (
          <div><FormControl style={{
            padding: '1px',
            height: '200px'
          }} componentClass="textarea" value={this.state.script} onChange={(event) => {
            this.setState({script: event.target.value});
          }}/>{errorBox}
            <ControlLabel>args
            </ControlLabel>
            <FormControl type="text" placeholder='-t foo:1.0.0' size="10" onChange={(event) => {
              this.setState({dockerArgs: event.target.value});
            }}/>
            <h6>
              <a href="https://www.vagrantup.com/docs/provisioning/docker.html#build_image"
                 target="_blank">Documentation</a>
            </h6>
          </div>
        );

        dockerBuildFooter = <Form inline>
          <ControlLabel>Docker run command:</ControlLabel>
          {' '}
          <FormControl type="text" placeholder='run "test/image:1.0"' onChange={(event) => {
            this.setState({buildRun: event.target.value})
          }}/>
        </Form>;

        break;
      }
      case 'shell': {
        sidePanel = <FormControl style={{
          padding: '1px',
          height: '200px'
        }} componentClass="textarea" value={this.state.script} onChange={(event) => {
          this.setState({script: event.target.value});
        }}/>;
        dropzone = fullDropzone;
        break;
      }

    }

    return (
      <Row>
        <Col xs={6}>
          <Form inline>
            <FormGroup validationState={this.getValidationState('name')}>
              <ControlLabel>Name</ControlLabel>
              {' '}
              <FormControl type="text" size="10" value={this.state.name} onChange={(event) => {
                this.setState({name: event.target.value})
              }}/>
            </FormGroup>
            <FormGroup validationState={this.getValidationState('boxName')}>
              <ControlLabel>Box</ControlLabel>
              {' '}
              <FormControl type="text" placeholder="Box name" size="10" value={this.state.boxName}
                           onChange={(event) => {
                             this.setState({boxName: event.target.value})
                           }}/> </FormGroup>{'   '}
            <a href="https://atlas.hashicorp.com/boxes/search?provider=virtualbox" target="_blank">search</a>
          </Form>
          <Accordion>
            <Panel eventKey="2" header="Network options">
              <Row>
                <Col xs={4}>
                  <FormGroup>
                    <ControlLabel>Network type</ControlLabel>
                    <FormControl componentClass="select" placeholder="select" onChange={(event) => {
                      console.log('yayayyaaaaa');
                      this.setState({networkType: event.target.value})
                    }}>
                      <option value="">Select
                      </option>
                      <option value="forwarded_port">Forwarded Port
                      </option>
                      <option value="private_network">Private Network</option>
                      <option value="public_network">Public Network</option>
                    </FormControl>
                  </FormGroup>
                </Col>
                <Col xs={8}>
                  <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                      <th>INSTRUCTION</th>
                      <th>arguments</th>
                      <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {networkNodes}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Panel>
          </Accordion>
          <Accordion>
            <Panel eventKey="3" header="Provisions options">
              <Row>
                <Col xs={4}>
                  <FormGroup>
                    <ControlLabel>Provisioner</ControlLabel>
                    <FormControl componentClass="select" placeholder="select" onChange={(event) => {
                      this.setState({provisioning: event.target.value})
                    }}>
                      <option value="">Select
                      </option>

                      <option value="docker">Docker build</option>
                      <option value="shell">Shell Script</option>

                    </FormControl>
                    {dropzone}
                    {savedDockerfile}
                  </FormGroup>
                </Col>
                <Col xs={8}>
                  <ControlLabel>Configuration</ControlLabel>
                  {sidePanel}
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  {dockerBuildFooter}
                </Col>
                <h6>
                  <a href="https://www.vagrantup.com/docs/provisioning/" target="_blank">Documentation</a>
                </h6>
              </Row>
            </Panel>
          </Accordion>
        </Col>
        <Col xs={6}>
          <pre>{this.stateToConfig()}</pre>
        </Col>
      </Row>
    );
  }

  stateToConfig = () => {
    const {boxName, networkType, networkRows, provisioning} = this.state;
    let obj = {
      config: {
        vm: {
          box: boxName
        }
      }
    };
    if (networkType) {
      obj.config.network = {};
      obj.config.network.type = networkType;
      let detailObj = {};
      networkRows.forEach(item => {
        detailObj[item.instruction] = item.arguments
      });
      obj.config.detail = detailObj;
    }
    if (provisioning) {
      obj.config.provisioners = obj.config.provisioners || [];
      switch (provisioning) {
        case 'docker': {
          let provisionerObj = {
            type: 'docker',
            name: 'docker1',
            commands: ['build_image "/vagrant"']
          };
          if (this.state.dockerArgs) {
            provisionerObj.commands[0] = 'build_image "/vagrant", args:"' + this.state.dockerArgs + '"';
          }
          if (this.state.buildRun) {
            provisionerObj.commands[1] = this.state.buildRun;
          }
          obj.config.provisioners.push(provisionerObj);
        }
          break;

        case 'shell': {
          let provisionerObj = {
            type: 'shell',
            name: 'shell1',
            config: {
              path: '"/vagrant/provision.shell.sh"'
            }
          };
          obj.config.provisioners.push(provisionerObj);
        }
          break;

      }
    }
    return JSON.stringify(obj, null, 2);
    /*{
     "config": {
     "vm": {
     "box": "ubuntu/trusty64"
     },
     "network": {
     "type": "public_network",
     "detail": {
     "guest": 83,
     "host": 85
     }
     },
     "providers": {
     "virtualbox": {
     "memory": 384
     },
     "lxc": {
     "container_name": "'test'"
     }
     },
     "provisioners": [
     {
     "type": "shell",
     "name": "shell1",
     "config": {
     "path": "'./provision.shell.sh'"
     }
     }, {
     "type": "ansible",
     "name": "ansible1",
     "config": {
     "playbook": "'playbook.yml'"
     }
     }, {
     "type": "docker",
     "name": "docker1",
     "config": {
     "pull_images": "'ubuntu'"
     }
     }, {
     "type": "docker",
     "name": "docker2",
     "config": {
     "commands": ["pull_images 'ubuntu'", "pull_images 'ubuntu'", "run 'rabbitmq'", "run \"ubuntu\", cmd: \"bash -l\", args: \"-v '/vagrant:/var/www'\"", "run \"db-1\", image: \"user/mysql\""]
     }
     }, {
     "type": "file",
     "name": "file1",
     "config": {
     "source": "'./Vagrantfile'",
     "destination": "'~/OutputVagrantfile'"
     }
     }
     ]
     }
     }*/
  };

  onDrop = (file) => {
    xhr({
      method: 'get',
      uri: file.preview
    }, (err, resp, body) => {
      console.log(body);
      if (resp.statusCode === 200) {
        this.setState({script: body})
      } else {
        console.log('Error updating image');
        console.log(err);
      }
    });
  };

  saveAndBuild = () => {
    let body = {};
    if (this.props.type === 'docker') {
      var {name, tag} = this.state;
      body = {
        status: 'building',
        type: this.props.type,
        name,
        tag,
        config: {
          build: this.state.rows
        }
      }
    } else if (this.props.type === 'vagrant') {
      console.log('vagrant!');
      console.log(this.state.script);
      console.log(this.stateToConfig());
      body.config = this.stateToConfig();
      body.type = 'vagrant';
      body.script = this.state.script;
      body.name = this.state.name;
      body.status = 'building';
      body.oldState=this.state;
    }

    this.props.onHide();
    if (this.isEditing()) {
      switch (this.props.itemData._action) {
        case 'edit':
          xhr({
            json: body,
            method: 'put',
            uri: baseUrl + '/v1/images/' + this.props.itemData.uid

          }, (err, resp, body) => {
            this.props.getData();
            if (resp.statusCode === 200) {
              // this.setState({data: JSON.parse(body)});

            } else {
              console.log('Errorupdatingimage');
              console.log(err);
            }
          });
          break;
        case 'duplicate':
          this.sendImage(body);
          break;

      }
      //edit image

    } else {
      //new image
      this.sendImage(body);
    }
  };

  sendImage = (json) => {
    xhr({
      json,
      method: 'POST',
      uri: baseUrl + '/v1/images/new'

    }, (err, resp, body) => {
      this.props.getData();

      if (resp.statusCode === 200) {
        // this.setState({data: JSON.parse(body)});

      } else {
        console.log('Error posting new image');
        console.log(err);
      }
    })
  };

  isDisabled() {
    if (this.props.type === 'docker') {
      return !this.isFormValid(['name', 'tag']);
    } else {
      return !this.isFormValid(['name', 'boxName']);
    }

  }

  isFormValid(fields) {
    return fields.every(element => {
      const value = this.state[element];
      if (value !== undefined) {
        return this.state[element].length > 0;
      }
      return false;
    });
  }
}

class ErrorsBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const dockerfile = this.props.dockerfile;
    let isValid = validateDockerfile(dockerfile, {quiet: false});
    let componet = '';

    const style = {
      padding: '1px',
      marginBottom: '1px'
    }
    if (isValid.valid) {
      return null;
    } else {
      let errors = isValid.errors.map((error, index) => {
        if (error.priority === 0) {
          return (
            <Alert bsStyle="danger" key={index} style={style}>
              <strong>Line {error.line}:
              </strong>
              {error.message}
            </Alert>
          );
        } else if (error.message !== 'Missing CMD') {
          return (
            <Alert bsStyle="warning" key={index} style={style}>
              <strong>Line {error.line}:
              </strong>
              {error.message}
            </Alert>
          );
        }
      });
      return (
        <div>{errors}</div>
      )
    }
  }
}
