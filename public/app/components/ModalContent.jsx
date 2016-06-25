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
import {generateUid,baseUrl} from '../lib';
////////////////
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
class ModalContent extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props.itemData);
        if(this.props.itemData){
          this.state = {rows:this.props.itemData.config.build};
        }else{
          this.state = {
            rows: [
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
                    <Row>
                        <Col xs={3}>
                            <ControlLabel>Name this template</ControlLabel>
                        </Col>

                        <Col xs={5}>
                            <FormControl type="text"/>
                        </Col>
                        <Col xs={4}>

                            <Button onClick={this.saveAndBuild} bsStyle='success'>Save and Build</Button>
                            <Button onClick={this.props.onHide} bsStyle='danger'>Close</Button>
                        </Col>
                    </Row>
                </Modal.Footer>
            </div>
        )
    }

    componentDidMount() {
        this.updateRows('FROM', 0, 'instruction');
    }

    createForm() {

        if (this.props.type === 'docker') {
            return this.createDockerForm();
        } else if (this.props.type === 'docker') {
            return (
                <h1>vagrant</h1 >
            );
        }
    }
    removeRow = (index) => {

        var rows = this.state.rows.slice();

        if (rows.length > 1) {
            rows.splice(index, 1);
        }
        this.setState({rows});

    }

    addNewRow = (index) => {

        var rows = this.state.rows.slice();
        rows.splice(index + 1, 0, {
            instruction: '',
            arguments: ''
        });
        this.setState({rows});
    }

    updateRows = (value, index, field) => {
        var rows = this.state.rows.slice();
        rows[index][field] = value;
        this.setState({rows})
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
        let styles = {
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
        }

        function matchStateToTerm(state, value) {
            return (state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
        }

        var rowNodes = this.state.rows.map((item, index) => {

            return (
                <tr key={index}>
                    <td>{index}</td>
                    <td><Autocomplete inputProps={{
                    size: '10'
                }} menuStyle={styles.menu} value={this.state.rows[index].instruction} items={dockerfile} getItemValue={(item) => item.name} shouldItemRender={matchStateToTerm} onChange={(event) => {
                    this.updateRows(event.target.value, index, 'instruction');
                }} onSelect={(value) => {
                    this.updateRows(value, index, 'instruction');
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
                            this.updateRows(event.target.value, index, 'arguments');
                        }}/>

                    </td>
                    <td>
                        <ButtonGroup>
                            <Button bsStyle="success" bsSize="small" onClick={this.addNewRow.bind(null, index)}><Glyphicon glyph="plus"/></Button>
                            <Button bsStyle="danger" bsSize="small" onClick={this.removeRow.bind(null, index)}><Glyphicon glyph="trash"/>
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
                        <Panel header="Start options" eventKey="1">
                            <Row>
                                <Col xs={12}>
                                    <Form inline>
                                        <ControlLabel>Tag Image:</ControlLabel>
                                        {' '}
                                        <FormControl type="text" placeholder="name" size="8" onChange={this.handleFieldChange.bind(this, 'name')}/><FormControl type="text" placeholder="tag" size="8" onChange={this.handleFieldChange.bind(this, 'tag')}/></Form>
                                </Col>
                                <Col xs={12}>
                                    <Form inline>
                                        <ControlLabel>PortBindings:</ControlLabel>
                                        {' '}<FormControl type="text" placeholder="Host IP Address" size="8" onChange={this.handleFieldChange.bind(this, 'hostIP')}/><FormControl type="text" placeholder="Host Port" size="8" onChange={this.handleFieldChange.bind(this, 'hostPort')}/><FormControl type="text" placeholder="Container Port" size="8" onChange={this.handleFieldChange.bind(this, 'containerPort')}/>
                                        <FormControl componentClass="select" onChange={this.handleFieldChange.bind(this, 'protocol')}>
                                            <option value="">both</option>
                                            <option value="tcp">tcp</option>
                                            <option value="udp">udp</option>
                                        </FormControl>
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
      if(this.props.itemData){
        //edit image
        xhr({
            json: body,
            method: 'put',
            uri: baseUrl + '/v1/images/'+this.props.itemData.uid

        }, (err, resp, body) => {
          this.props.getData();


            if (resp.statusCode === 200) {
                // this.setState({data: JSON.parse(body)});


            } else {
                console.log('Errorupdatingimage');
                console.log(err);
            }
        })
      }else{
        //new image
        xhr({
            json: body,
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
