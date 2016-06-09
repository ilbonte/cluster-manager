import React from "react";
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import Well from 'react-bootstrap/lib/Well';

class CustomTable extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
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
        let tableStyle = {
          "margin": "0 0 40px 0",
          "width": "100%",
          "boxShadow": "0 1px 3px rgba(0, 0, 0, 0.2)",
          "display": "table"
        };
        return (
            <div style={tableStyle}>
                <TableHeader>
                  <TableCell>header</TableCell>
                  <TableCell>altro header</TableCell>
                  <TableCell>altro asd</TableCell>
                </TableHeader>

                  <TableRow  onClick={()=> this.setState({ open: !this.state.open })} >
                    <TableCell>primo</TableCell>
                    <TableCell>secondo</TableCell>
                    <TableCell>terzo</TableCell>
                  </TableRow>
                  <Collapse in={this.state.open}>
                    <div>
                      <Well>
                        Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid.
                        Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
                      </Well>
                    </div>
                  </Collapse>

                  <TableRow>
                    <TableCell>pbis</TableCell>
                    <TableCell>sebis</TableCell>
                    <TableCell>gfdg</TableCell>
                  </TableRow>

            </div>
        );
    }

}


class TableHeader extends React.Component {
    render() {

        console.log(this.props.children);
        var headerStyle = {
          display: "table-row",
          fontWeight: "900",
          color: "#ffffff",
          background: "#ea6153"
        };

        return (<div style={headerStyle}>{this.props.children}</div>);

    }
}


class TableRow extends React.Component {

  render() {
    let rowStyle= {
      display: "table-row",
      background: "#f6f6f6"
    }
    return (
      <div style={rowStyle}>
        {this.props.children}

      </div>
    );
  }
}

class TableCell extends React.Component {
    render() {
      let cellStyle= {
        padding: "6px 12px",
        display: "table-cell"
      }
        return (<div style={cellStyle}>{this.props.children}</div>);

    }
}

class TableTitle extends React.Component {
    render() {

        console.log(this.props.children);
        var titleStyle = {
            color: 'red',
            fontFamily:"Arial"
        };

        return (<h1 style={titleStyle}>{this.props.children}</h1>);

    }
}


export default CustomTable;
