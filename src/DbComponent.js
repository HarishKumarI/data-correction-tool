import React, { Fragment } from 'react'
import { Table, Dropdown,Menu,Pagination, Button } from 'semantic-ui-react'
import $ from 'jquery'

const AdminIds = [103,106]

class ReviewForm extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.answerData
        this.updateState = this.updateState.bind(this)
        this.requestServer = this.requestServer.bind(this)
    }

    updateState(event){
        this.setState({ state: event.target.innerText})
    }

    requestServer(){
        this.props.updateansData(this.state)
        $.post('/updateRow',JSON.stringify(this.state),(response,status) => {
            console.log(response)
        })
    }

    render(){    
    const isAdmin = ( AdminIds.includes( parseInt(this.props.user_id) ) ) ? true : false

    return (
            <Fragment>
                # {this.state.id}
                <Table fluid="true" inverted>
                    <Table.Body>
                        <tr>
                            <td> User Id: </td>
                            <td> {this.state.user_id} </td>
                            <td style={{ textAlign: 'right' }}> UserName : </td>
                            <td style={{ textAlign: 'left' }}> { this.state.username } </td>
                            <td style={{ textAlign: 'right' }}> Email : </td>
                            <td> { this.state.email } </td>
                        </tr>
                        <tr>    
                            <td>Question: </td>
                            <td colSpan="5"> {this.state.question} </td>
                        </tr>
                        <tr>    
                            <td>Answer: </td>
                            <td colSpan="5"> {this.state.answer} </td>
                        </tr>
                        <tr>    
                            <td>Comment: </td>
                            <td colSpan="5"> {this.state.cmt} </td>
                        </tr>
                        <tr>    
                            <td>State: </td>
                            <td colSpan="2">
                                { ( isAdmin ) ?
                                    <Dropdown 
                                    item text={`${this.state.state}`}
                                    className='icon'
                                    >
                                        <Dropdown.Menu  onClick={ this.updateState }>
                                            <Dropdown.Item text='Open' />
                                            <Dropdown.Item text='In Analysis' />
                                            <Dropdown.Item text='Fix Planned' />
                                            <Dropdown.Item text='Fixed' />
                                            <Dropdown.Item text='Closed' />
                                            <Dropdown.Item text='Deferred' />
                                            <Dropdown.Item text="Won't Fix" />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                :  this.state.state  } 
                                </td>
                            <td colSpan="3"> 
                                { ( isAdmin ) ?
                                <Button content=" Update State " primary onClick={ this.requestServer} />
                                : null}
                            </td> 
                        </tr>
                    </Table.Body>
                </Table> 

            </Fragment>
        )
    }
}

class DbData extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            data: {},
            activeIndex: undefined,
            relevant: undefined,
            relevantData: [],
            maxrows: 20,
            starrtIndex: 0,
            activePage: 1
        }

        this.getrows = this.getrows.bind(this)
        this.updateQue_obj = this.updateQue_obj.bind(this)
    }

    componentDidMount(){

        $.get('/dbData',(response,status) =>{
            let reldata = []

        response.forEach(element => {
            if (element.relevant) {
                reldata.push(element)
            }
        });

        this.setState({
            data: response,
            relevantData: reldata
        })
        })
    }


    updateQue_obj(obj){ 
        let temp_data = this.state.data
        temp_data[obj.id-1] = obj 
        console.log(temp_data)
        this.setState({data: temp_data})
    }


    getrows(rowsData){
        let rows = []

        for( let index = this.state.starrtIndex; 
             rows.length < this.state.maxrows && index < rowsData.length  ;
             index++ ){

            let que_object = rowsData[index]

            let bgColor = ( que_object.relevant ) ? '#365436' : ( que_object.relevant===undefined ) ? '' : '#c1383838' 

            if( this.state.relevant === undefined || que_object.relevant === this.state.relevant )
                rows.push(
                    <Fragment key={index}>
                        <Table.Row 
                            style={{ cursor: 'pointer', backgroundColor: bgColor }}                       
                            onClick={() => { ( this.state.activeIndex === index) ? this.setState({activeIndex: undefined}) : this.setState({activeIndex: index}) }} >
                                <Table.Cell width='1'> { index + 1 } </Table.Cell>
                                <Table.Cell width='6'> { que_object.question } </Table.Cell>
                                <Table.Cell width='3'> { ( que_object.relevant ) ? '' : 'Not ' } Relevant </Table.Cell>
                                <Table.Cell width='2' id={`${index}_state`}> { que_object.state } </Table.Cell>
                        </Table.Row>
                        
                        {
                            ( this.state.activeIndex === index ) ? 
                                <Table.Row  >
                                    <Table.Cell colSpan='4'>
                                        <ReviewForm answerData={que_object} updateansData={this.updateQue_obj} user_id={this.props.user_id} />
                                    </Table.Cell>
                                </Table.Row>
                            : null
                        }
                    </Fragment>
                )   
        }

        return rows
    }


    render(){

        const relventtext = ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===undefined ) ? 'Show All' : 'Not Relevant' 
        let rowsData = ( this.state.relevant ) ? this.state.relevantData : ( this.state.relevant===undefined ) ? this.state.data : this.state.data 
        let rows = this.getrows(rowsData)
        
        return(
            <Fragment>
                
                <div className="controls" >
                    <Menu secondary>
                        <Menu.Item
                        name={ `Accuracy ` }
                        />
                        <Menu.Item
                        name={ `Relevant ${ this.state.relevantData.length }` }
                        style={{ backgroundColor: '#365436' }}
                        />
                        <Menu.Item
                        name={ `Not Relevant ${ this.state.data.length - this.state.relevantData.length }`}
                        style={{ backgroundColor: '#c1383838' }}
                        />

                        <Dropdown 
                            item text={`Maximum Rows ${this.state.maxrows}`}
                            className='icon'
                        >
                            <Dropdown.Menu  onClick={(event) => this.setState({ maxrows: event.target.innerText}) }>
                                <Dropdown.Item text='30' />
                                <Dropdown.Item text='50' />
                                <Dropdown.Item text='100' />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu>   
                </div>

                <div className="dataTable">
                    <Table inverted>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>#</Table.HeaderCell>
                            <Table.HeaderCell>Question</Table.HeaderCell>
                            <Table.HeaderCell>
                                
                                <Dropdown
                                    text={ relventtext }  
                                    icon='filter'
                                >
                                    <Dropdown.Menu >
                                        <Dropdown.Item onClick={() => {this.setState({ relevant: true})} } text='Relevant' />
                                        <Dropdown.Item onClick={() => {this.setState({ relevant: false})} } text='Not Relevant' />
                                        <Dropdown.Item onClick={() => {this.setState({ relevant: undefined})} } text='Show All' />
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Table.HeaderCell>
                            <Table.HeaderCell width='1'> State </Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>
                        
                        <Table.Body>
                            {rows}
                        </Table.Body>

                        <Table.Footer>
                        <Table.Row>
                            <Table.Cell colSpan='4'style={{ padding: 0,textAlign: 'center' }} >
                                { ( rowsData.length > this.state.maxrows ) ?
                                    <Pagination inverted
                                        defaultActivePage={1}
                                        firstItem={null}
                                        lastItem={null}
                                        onPageChange={(event) => { this.setState({ activePage: event.target.value}) }}
                                        pointing
                                        secondary
                                        totalPages={ Math.ceil(rowsData.length / this.state.maxrows) }
                                    />
                                : null } 
                            </Table.Cell>
                        </Table.Row>
                        </Table.Footer>
                    </Table>

                </div>
            </Fragment>
        )
    }
}


export default function DbComponent(props){

    return(
    <div style={{ width: '80vw', maxWidth: '800px' }}>            
            
            <h3 style={{ marginTop: 20+'px',color: 'white' }}> Dashboard </h3>
            <DbData user_id={ props.user_id}/>

    </div>
    )

}