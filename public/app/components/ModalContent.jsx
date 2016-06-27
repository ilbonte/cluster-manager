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
import Grid from 'react-bootstrap/lib/Grid';
import Label from 'react-bootstrap/lib/Label';
import Modal from 'react-bootstrap/lib/Modal';
import Panel from 'react-bootstrap/lib/Panel';
import Row from 'react-bootstrap/lib/Row';
import Table from 'react-bootstrap/lib/Table';
///////////////////////////////////////
let validateDockerfile = require('validate-dockerfile');
const xhr = require('xhr');
import {generateUid, baseUrl} from '../lib';
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
const styles = {
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
class ModalContent extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props.itemData);
        if (this.props.itemData) {
            this.state = {
                rows: this.props.itemData.config.build
            };
        } else {
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
    render() {
        return (
            <div>
                <Modal.Body >
                    {this.createForm()}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.saveAndBuild} bsStyle='success'>Save and Build</Button>
                    <Button onClick={this.props.onHide} bsStyle='danger'>Close</Button>
                </Modal.Footer>
            </div>
        )
    }

    componentDidMount() {
        this.updateStateElement('rows', 'FROM', 0, 'instruction');
    }

    createForm() {

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

    }

    addStateElement = (elem, index) => {
        let rows = this.state[elem].slice();
        console.log(rows);
        rows.splice(index + 1, 0, {
            instruction: '',
            arguments: ''
        });
        console.log(rows);

        this.setState({[elem]: rows});
        // console.log(index);
        // console.log(this.state[elem]);
    }

    updateStateElement = (elem, value, index, field) => {
        let rows = this.state[elem].slice();
        rows[index][field] = value;
        this.setState({[elem]: rows})
    }

    handleFieldChange = (field, event) => {

        this.setState({[field]: event.target.value});

    }
    printDockerfile = () => {
        let dockerString = '';
        this.state.rows.forEach((item) => {
            dockerString += item.instruction + ' ' + item.arguments + ' \n';
        });
        return dockerString;
    }

    createDockerForm() {

        var rowNodes = this.state.rows.map((item, index) => {

            return (
                <tr key={index}>
                    <td>{index}</td>
                    <td><Autocomplete inputProps={{
                    size: '10'
                }} menuStyle={styles.menu} value={this.state.rows[index].instruction} items={dockerfile} getItemValue={(item) => item.name} shouldItemRender={matchStateToTerm} onChange={(event) => {
                    this.updateStateElement('rows', event.target.value, index, 'instruction');
                }} onSelect={(value) => {
                    this.updateStateElement('rows', value, index, 'instruction');
                }} renderItem={(item, isHighlighted) => (
                    <div style={isHighlighted
                        ? styles.highlightedItem
                        : styles.item} key={item.name}>{item.name}
                        <a href={'https://docs.docker.com/engine/reference/builder/#' + item.name.toLowerCase()} target='_blank'>{' '}
                            #</a>
                    </div>
                )}/></td>
                    <td>
                        <FormControl value={this.state.rows[index].arguments} style={{
                            padding: '1px'
                        }} componentClass="textarea" onChange={(event) => {
                            this.updateStateElement('rows', event.target.value, index, 'arguments');
                        }}/>

                    </td>
                    <td>
                        <ButtonGroup>
                            <Button bsStyle="success" bsSize="small" onClick={this.addStateElement.bind(null, 'rows', index)}><Glyphicon glyph="plus"/></Button>
                            <Button bsStyle="danger" bsSize="small" onClick={this.removeStateElement.bind(null, 'rows', index)}><Glyphicon glyph="trash"/>
                            </Button>
                        </ButtonGroup>
                    </td>
                </tr>
            );
        });

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
                    }} componentClass="textarea" value={this.printDockerfile()}/>
                    <ErrorsBox dockerfile={this.printDockerfile()}/>
                </Col>
                <Col xs={12}>
                    <Accordion>
                        <Panel header="Start options">
                            <Row>
                                <Col xs={12}>
                                    <Form inline>
                                        <ControlLabel>Tag Image:</ControlLabel>
                                        {' '}
                                        <FormControl type="text" placeholder="name" size="8" onChange={this.handleFieldChange.bind(this, 'name')}/><FormControl type="text" placeholder="tag" size="8" onChange={this.handleFieldChange.bind(this, 'tag')}/></Form>
                                </Col>

                            </Row>
                        </Panel>
                    </Accordion>
                </Col>
            </Row>

        );
        return (content);
    }

    //*********************VAGRANT ******************************************
    //***************************************************************

    createVagrantForm() {

        var networkNodes = this.state.networkRows.map((item, index) => {

            return (
                <tr key={index}>
                    <td><Autocomplete inputProps={{
                    size: '10'
                }} menuStyle={styles.menu} value={this.state.networkRows[index].instruction} items={vagrantConfig[this.state.NetworkType]} getItemValue={(item) => item.name} shouldItemRender={matchStateToTerm} onChange={(event) => {
                    this.updateStateElement('networkRows', event.target.value, index, 'instruction');
                }} onSelect={(value) => {
                    this.updateStateElement('networkRows', value, index, 'instruction');
                }} renderItem={(item, isHighlighted) => (
                    <div style={isHighlighted
                        ? styles.highlightedItem
                        : styles.item} key={item.name}>{item.name}
                    </div>
                )}/></td>
                    <td>
                        <FormControl value={this.state.networkRows[index].arguments} style={{
                            padding: '1px'
                        }} componentClass="textarea" onChange={(event) => {
                            this.updateStateElement('networkRows', event.target.value, index, 'arguments');
                        }}/>

                    </td>
                    <td>
                        <ButtonGroup>
                            <Button bsStyle="success" bsSize="small" onClick={this.addStateElement.bind(null, 'networkRows', index)}><Glyphicon glyph="plus"/></Button>
                            <Button bsStyle="danger" bsSize="small" onClick={this.removeStateElement.bind(null, 'networkRows', index)}><Glyphicon glyph="trash"/>
                            </Button>
                        </ButtonGroup>
                    </td>
                </tr>
            );
        });

        return (
            <Row>
                <Col xs={6}>
                    <Form inline>
                        <ControlLabel>Box name
                            <a href="https://atlas.hashicorp.com/boxes/search?provider=virtualbox" target="_blank">#</a>
                        </ControlLabel>
                        {' '}
                        <FormControl type="text" placeholder="Box name" size="10"/></Form>
                    <Accordion >
                        <Panel eventKey="2" header="Network options">
                            <Row>
                                <Col xs={4}>
                                    <FormGroup>
                                        <ControlLabel>Network type</ControlLabel>
                                        <FormControl componentClass="select" placeholder="select" onChange={(event) => {
                                            this.setState({NetworkType: event.target.value})
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
                    <Accordion >
                        <Panel eventKey="3" header="Provisions options">
                            <Row>
                                <Col xs={12}></Col>
                            </Row>
                        </Panel>
                    </Accordion>
                </Col>
                <Col xs={6}>
                    <h1>Vagtrant file</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </Col>
            </Row>
        )
    }

    //***************************************************************
    //*********************VAGRANT END******************************************

    saveAndBuild = () => {

        const {name, tag, hostIP, hostPort, containerPort} = this.state
        let body = {
            status: 'building',
            type: this.props.type,
            name,
            tag,
            config: {
                build: this.state.rows,
                run: {
                    hostIP,
                    hostPort,
                    containerPort
                }
            }
        }

        this.props.onHide();
        if (this.props.itemData) {
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
                default:

            }
            //edit image

        } else {
            //new image
            this.sendImage(body);
        }

    }

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
    }
}

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------

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

export default ModalContent;
