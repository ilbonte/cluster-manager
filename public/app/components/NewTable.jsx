import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';
import Accordion from 'react-bootstrap/lib/Accordion';
import Autocomplete from 'react-autocomplete';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Grid from 'react-bootstrap/lib/Grid';
import Label from 'react-bootstrap/lib/Label';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Panel from 'react-bootstrap/lib/Panel';
import Popover from 'react-bootstrap/lib/Popover';
import Row from 'react-bootstrap/lib/Row';
import Table from 'react-bootstrap/lib/Table';
import Well from 'react-bootstrap/lib/Well';
const xhr = require('xhr');
var validateDockerfile = require('validate-dockerfile');
const baseUrl = 'http://localhost:3000';
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
            data: [],
            templates: [],
            rows: [
                {
                    instruction: '',
                    arguments: ''
                }
            ]
        };
    }
    componentDidMount() {
        this.updateRows('FROM', 0, 'instruction');
        xhr({
            uri: baseUrl + this.props.getUrl
        }, (err, resp, body) => {
            // check resp.statusCode
            if (resp.statusCode === 200) {
                this.setState({data: JSON.parse(body)});
                // console.log(resp);
                console.log(JSON.parse(body));
            } else {
                console.log('Error getting data');
                console.log(err);
            }
        });
        if (this.props.title.toLowerCase() === 'images' && this.state.templates.length === 0) {
            //nothing in the 'cache'
            xhr({
                uri: baseUrl + '/v1/templates'
            }, (err, resp, body) => {
                // check resp.statusCode
                if (resp.statusCode === 200) {
                    console.log('templates....');
                    this.setState({templates: JSON.parse(body)});
                } else {
                    console.log('Error getting templates');
                    console.log(err);
                }
            });
        }
    }
    render() {
        const {title} = this.props;
        let rowNodes = this.state.data.map((item) => {
            return (<TableRow data={item} key={item.uid}/>);
        });
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
                        <Button bsStyle="success" onClick={this.setSelectedType.bind(this, dockerTemplate)}><Glyphicon glyph="plus"/>
                            Docker</Button>
                        <Button bsStyle="success" onClick={this.setSelectedType.bind(this, vagrantTemplate)}><Glyphicon glyph="plus"/>
                            Vagrant</Button>
                    </ButtonToolbar>
                    <Modal show={this.state.showModal} onHide={this.close} bsSize='large'>
                        <Modal.Header closeButton>
                            <Modal.Title>Configure your image</Modal.Title>
                        </Modal.Header>
                        <Modal.Body >
                            {this.createModalBody()}
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
                                    <Button onClick={this.save} bsStyle='success'>Save</Button>
                                    <Button onClick={this.saveAndBuild} bsStyle='success'>Save and Build</Button>
                                    <Button onClick={this.close} bsStyle='danger'>Close</Button>
                                </Col>
                            </Row>
                        </Modal.Footer>
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
    close = () => {
        this.setState({showModal: false});
    }
    save = () => {
        console.log('save');
        console.log(this.state);
    }

    open = () => {
        this.setState({showModal: true});
    }
    setSelectedType = (type) => {
        this.setState({selectedType: type});
        this.open();
    }

    removeRow = (index) => {
        console.log(index);
        console.log(this.state);
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
                border: 'solid 1px #ccc'
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
                }} value={this.state.rows[index].instruction} items={dockerfile} getItemValue={(item) => item.name} shouldItemRender={matchStateToTerm} onChange={(event) => {
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
                        }}/></td>
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
                        <Panel header="Build options">
                            <Row>
                                <Col xs={12}>
                                    <Form inline>
                                        <ControlLabel>Tag Image:</ControlLabel>
                                        {' '}
                                        <FormControl type="text" placeholder="repository" size="8"/><FormControl type="text" placeholder="tag" size="8"/></Form>
                                </Col>
                                <Col xs={12}>
                                  <Form inline>
                                    <ControlLabel>PortBindings:</ControlLabel>
                                    {' '}<FormControl type="text" placeholder="Host IP Address" size="8"/><FormControl type="text" placeholder="Host Port" size="8"/><FormControl type="text" placeholder="Container Port" size="8"/>
                                    <FormControl componentClass="select" placeholder="protocol">
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
    createForm() {

        if (this.state.selectedType) {
            if (this.state.selectedType.type === 'docker') {
                return this.createDockerForm();
            } else {
                return (
                    <h1>naaaahah</h1 >
                );
            }
        }
    }
    createModalBody = () => {
        // let options = this.state.templates.map((item) => {
        //     return (<Button bsStyle="success" key={item.type} onClick={this.setSelectedType.bind(this,item)}>{item.type}</Button>);
        // });
        return (
            <div>
                {this.createForm()}
            </div>
        )
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
        let {type, name, status, uid} = this.props.data;
        return (
            <div>
                <Row style={headerStyle} onClick={() => this.setState({
                    open: !this.state.open
                })}>
                    <TableCell>{type}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>Bei botoni</TableCell>
                </Row>
                <Row>
                    <Collapse in={this.state.open}>
                        <div>
                            <Well>
                                {uid}
                            </Well>
                        </div>
                    </Collapse>
                </Row>
            </div>
        );
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
