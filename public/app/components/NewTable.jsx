import React from 'react';
import Accordion from 'react-bootstrap/lib/Accordion';
import Button from 'react-bootstrap/lib/Button';
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
                        <Button bsStyle="success" onClick={this.setSelectedType.bind(this, 'docker')}><Glyphicon glyph="plus"/>
                            Docker</Button>
                        <Button bsStyle="success" onClick={this.setSelectedType.bind(this, 'vagrant')}><Glyphicon glyph="plus"/>
                            Vagrant</Button>

                    </ButtonToolbar>
                    <Modal show={this.state.showModal} onHide={this.close} bsSize='lg'>
                        <Modal.Header closeButton>
                            <Modal.Title>Configure your image</Modal.Title>
                        </Modal.Header>
                        <ModalContent type={this.state.selectedType} onHide={this.close}/>
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
                inspection = this.props.data.inspect||{};

                this.props.data.config.build.forEach(step => {
                    build += step.instruction + ' ' + step.arguments + '\n';
                });
                if(log){
                  log.forEach(step => {
                    buildLog += step.stream+'\n';
                  })
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
                          <Col xs={6}>
                            <h3>Build Steps</h3>
                            <pre>{build}</pre>
                          </Col>
                        <Col xs={12}>
                            <h3>Build log</h3>
                            <pre>{buildLog}</pre>
                        </Col>
                        <Col xs={12}>
                            <h3>Image Details</h3>
                            <Inspector expandLevel={0} data={inspection}/>
                        </Col>
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
