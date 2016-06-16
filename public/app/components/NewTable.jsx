import React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import Panel from 'react-bootstrap/lib/Panel';
import Button from 'react-bootstrap/lib/Button';
import Well from 'react-bootstrap/lib/Well';
import Label from 'react-bootstrap/lib/Label';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Autocomplete from 'react-autocomplete';

const xhr = require('xhr');
const baseUrl = 'http://localhost:3000';

const dockerfile=[{
    name: 'FROM'
}, {
    name: 'MANTAINER'
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
}];

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
            templates: []
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
                <Col xs={6} style={{
                    textAlign: 'right'
                }}>
                    <Button onClick={this.open}>Add Image</Button>
                    <Modal show={this.state.showModal} onHide={this.close} bsSize='large'>
                        <Modal.Header closeButton>
                            <Modal.Title>Modal heading</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.createModalBody()}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.close}>Close</Button>
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

    open = () => {
        this.setState({showModal: true});
    }

    setSelectedType = (type) => {
        this.setState({selectedType: type})
    }
    createDockerForm() {
        let styles = {
            item: {
                padding: '2px 6px',
                cursor: 'default'
            },

            highlightedItem: {
                color: 'white',
                background: 'hsl(200, 50%, 50%)',
                padding: '2px 6px',
                cursor: 'default'
            },

            menu: {
                border: 'solid 1px #ccc'
            }
        }
        function matchStateToTerm(state, value) {
            return (state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 )
        }
        function sortStates(a, b, value) {
            return (a.name.toLowerCase().indexOf(value.toLowerCase()) > b.name.toLowerCase().indexOf(value.toLowerCase())
                ? 1
                : -1)
        }
        return (<Autocomplete items={dockerfile} getItemValue={(item) => item.name}
         shouldItemRender={matchStateToTerm}
         sortItems={sortStates}
         onChange={(event, value) => this.setState({value})}
         onSelect={value => this.setState({value})}
         renderItem={(item, isHighlighted) => (
            <div style={isHighlighted
                ? styles.highlightedItem
                : styles.item} key={item.name}>{item.name}
            </div>
        )}/>);
    }
    createForm() {
        console.log('eccolo');
        console.log(this.state.selectedType);
        if (this.state.selectedType) {
            if (this.state.selectedType.type === 'docker') {
                return this.createDockerForm();
            } else {
                return (
                    <h1>naaaahah</h1>
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
                <ButtonToolbar>
                    <Button bsStyle="success" onClick={this.setSelectedType.bind(this, dockerTemplate)}>Docker</Button>
                    <Button bsStyle="success" onClick={this.setSelectedType.bind(this, vagrantTemplate)}>Vagrant</Button>
                </ButtonToolbar>
                {this.createForm()}
            </div>
        )
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
