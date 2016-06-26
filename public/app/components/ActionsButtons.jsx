import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
const xhr = require('xhr');
import {baseUrl, removeByKey} from '../lib';
//////////
const actionButtonSize = 'xsmall';
class ActionsButtons extends React.Component {

    render() {
        let {type, name, status} = this.props.data;
        let buttons = [];

        let deleteButton = <DeleteButton key={100} data={this.props.data} getData={this.props.getData}/>;
        let editButton = <Button  key={200}  bsSize={actionButtonSize} onClick={this.edit}><Glyphicon glyph="wrench"/></Button>;
        let duplicateButton = <DuplicateButton  key={300} data={this.props.data}  open={this.props.open}/>
        let runButton = <Button  key={400} bsStyle="success" bsSize={actionButtonSize}><Glyphicon glyph="send" /></Button>;

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
    duplicate=()=> {
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
export default ActionsButtons;
