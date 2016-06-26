import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Row from 'react-bootstrap/lib/Row';
const xhr = require('xhr');
import {baseUrl, removeByKey} from '../lib';
//////////
const actionButtonSize = 'xsmall';
export default class ActionsButtons extends React.Component {

    render() {
        let {type, name, status} = this.props.data;
        let buttons = [];

        let deleteButton = <DeleteButton key={100} data={this.props.data} getData={this.props.getData}/>;
        let editButton = <Button key={200} bsSize={actionButtonSize} onClick={this.edit}><Glyphicon glyph="wrench"/></Button>;
        let duplicateButton = <DuplicateButton key={300} data={this.props.data} open={this.props.open}/>
        let runButton = <RunButton key={400} data={this.props.data}><Glyphicon glyph="send"/></RunButton>;

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
            case 'builded':
                //builded=|delete
                if (this.props.data.RepoTags.length === 1) {
                    buttons.push(deleteButton);
                }
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
    edit = () => {
        console.log('edit');
        // this.props.open();
        this.props.data._action = 'edit';
        this.props.open(this.props.data);
    }
}

class DeleteButton extends React.Component {
    render() {
        let cellStyle = {
            border: '1px solid black'
        }
        return (
            <Button bsStyle="danger" bsSize={actionButtonSize}><Glyphicon glyph="trash" onClick={this.sendDelete}/></Button>
        );
    }
    sendDelete = (event) => {
        let json = {};
        if (this.props.data.RepoTags) {
            if (this.props.data.RepoTags.length === 1) {
                json.name = this.props.data.RepoTags[0];
            }
        }
        xhr({
            json,
            method: 'DELETE',
            uri: baseUrl + '/v1/images/' + this.props.data.uid

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

class DuplicateButton extends React.Component {
    duplicate = () => {
        this.props.data._action = 'duplicate';
        this.props.open(this.props.data);
    }
    render() {
        let cellStyle = {
            border: '1px solid black'
        }
        return (
            <Button bsStyle="info" bsSize={actionButtonSize} onClick={this.duplicate}><Glyphicon glyph="duplicate" key={3}/></Button>
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
    }

    open = () => {
        this.setState({showModal: true});
    }
    handleFieldChange = (field, event) => {

        this.setState({[field]: event.target.value});

    }
    startInstance = () => {
        this.setState({showModal: true});
        console.log(this.props.data.uid);
        xhr({
            json: {
                name: this.state.name,
                hostIP: this.state.hostIP,
                hostPort: this.state.hostPort,
                containerPort: this.state.containerPort,
                protocol: this.state.protocol
            },
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
        })
    }

    render() {

        return ( < Button key = {
            400
        }
        bsStyle = "success" bsSize = {
            actionButtonSize
        } > <Glyphicon glyph="send" onClick={this.open}/> < Modal show = {
            this.state.showModal
        }
        onHide = {
            this.close
        } > <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header> < Modal.Body > <Form inline>
            <ControlLabel>Name your instance</ControlLabel>
            {' '}
            <FormControl type="text" placeholder="name" size="8" onChange={this.handleFieldChange.bind(this, 'name')}/></Form> < Form inline > <ControlLabel>PortBindings:</ControlLabel>
            {' '} < FormControl type = "text" placeholder = "Host IP Address" size = "8" onChange = {
            this.handleFieldChange.bind(this, 'hostIP')
        } />< FormControl type = "text" placeholder = "Host Port" size = "8" onChange = {
            this.handleFieldChange.bind(this, 'hostPort')
        } />< FormControl type = "text" placeholder = "Container Port" size = "8" onChange = {
            this.handleFieldChange.bind(this, 'containerPort')
        } /> <FormControl componentClass="select" onChange={this.handleFieldChange.bind(this, 'protocol')}>
            <option value="">both</option>
            <option value="tcp">tcp</option>
            <option value="udp">udp</option>
        </FormControl> < /Form>



                            </Modal.Body > <Modal.Footer>
            <Button onClick={this.startInstance}>Start</Button>
            <Button onClick={this.close}>Close</Button>
        </Modal.Footer> < /Modal> < /Button >)
    }
}