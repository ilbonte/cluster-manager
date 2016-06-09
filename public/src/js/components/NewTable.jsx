import React from "react";
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import Panel from 'react-bootstrap/lib/Panel';
import Well from 'react-bootstrap/lib/Well';

// Table data as a list of array.

class NewTable extends React.Component {

    render() {
        let myData = [
            {
                name: "Alex",
                surname: "Rossi",
                age: 43,
                born: "Trento",
                info: " I wish I had better word, i don't care what you think...Random text or also better:  I wish i found some chords thatare in order"
            }, {
                name: "Luca",
                surname: "Verdi",
                age: 20,
                born: "cles",
                info: "Random text or also better: I wish I had better word, I wish i found some chords thatare in order"
            }
        ];
        let rowNodes = myData.map((person)=>{
          return (<TableRow data={person} key={person.name} />);
        });
        return (
                <Panel header={'People'} bsStyle="info">
                  <TableHeader>
                      <TableCell>Name</TableCell>
                      <TableCell>Surname</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Born</TableCell>
                  </TableHeader>
                     {rowNodes}
                </Panel>
        );
    }
}

class TableHeader extends React.Component {

    render() {
      let headerStyle={
        background:"#ea6153",
        color: "white",
        fontWeight:"900"
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
      let {name, surname, age, born, info} = this.props.data;
        return (
              <div>
                <Row style={headerStyle}  onClick={()=> this.setState({ open: !this.state.open })}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{surname}</TableCell>
                  <TableCell>{age}</TableCell>
                  <TableCell>{born}</TableCell>
                </Row>
                <Row>
                  <Collapse in={this.state.open}>
                    <div>
                      <Well>
                        {info}
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
        border: "1px solid black"
      }
        return (
              <Col sm={3} style={cellStyle}>{this.props.children}</Col>
        );
    }
}






export default NewTable;
