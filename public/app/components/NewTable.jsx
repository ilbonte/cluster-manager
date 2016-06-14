import React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import Panel from 'react-bootstrap/lib/Panel';
import Button from 'react-bootstrap/lib/Button';
import Well from 'react-bootstrap/lib/Well';
import Label from 'react-bootstrap/lib/Label';
var xhr = require('xhr');
// Table data as a list of array.

class NewTable extends React.Component {
    constructor(props){
      super(props);
      this.state= {
        data : []
      };
    }

    componentDidMount() {
      xhr({
      uri: this.props.getUrl

    },  (err, resp, body) => {
          // check resp.statusCode
          if(resp.statusCode===200){
            this.setState({data:JSON.parse(body)});
            // console.log(resp);
            console.log(JSON.parse(body));
          }else{
            console.log('Error getting data');
            console.log(err);
          }
      });

   }
    render() {
        let myData = [
            {
                name: 'Alex',
                surname: 'Rossi',
                age: 43,
                born: 'Trento',
                info: ' I wish I had better word, i don t care what you think...Random text or also better:  I wish i found some chords thatare in order'
            }, {
                name: 'Luca',
                surname: 'Verdi',
                age: 20,
                born: 'cles',
                info: 'Random text or also better: I wish I had better word, I wish i found some chords thatare in order'
            }
        ];
        let rowNodes = this.state.data.map((item)=>{
          return (<TableRow data={item} key={item.uid} />);
        });
        return (
                <Panel header={<Label bsStyle="default">Default</Label>} bsStyle='info'>
                  <TableHeader>
                      <TableCell>Type</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                  </TableHeader>
                     {rowNodes}
                </Panel>
        );
    }
}

class TableHeader extends React.Component {

    render() {
      let headerStyle={
        background:'#ea6153',
        color: 'white',
        fontWeight:'900'
      }
        return (
              <Row style={headerStyle}>{this.props.children}</Row>
        );
    }
}
class TableRow extends React.Component {
    constructor(){
      super();
      this.state = {};
    }
    render() {
      let headerStyle={

      }
      let {type, name, status, uid} = this.props.data;
        return (
              <div>
                <Row style={headerStyle}  onClick={()=> this.setState({ open: !this.state.open })}>
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
      let cellStyle={
        border: '1px solid black'
      }
        return (
              <Col sm={3} style={cellStyle}>{this.props.children}</Col>
        );
    }
}






export default NewTable;
