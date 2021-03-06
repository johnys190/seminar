import React, { Component } from 'react';
import './Trainee.css';
import { Radio, Form, Input, Button, Icon, Select, Col, Table, Popconfirm, message, notification, Row, DatePicker, Avatar, Upload } from 'antd';
import { Link } from 'react-router-dom';
import { getAvatarColor } from '../util/Colors';
import { getTraineeById, deleteItem, updateItem, uploadImage } from '../util/APIUtils';
import { formatDate, formatDateTime, humanize } from '../util/Helpers';
import { withRouter } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import LoadingIndicator from '../common/LoadingIndicator';

const FormItem = Form.Item;
const Option = Select.Option;

class Trainee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.match.params.id,
            pagination: false,
            columnsS : [
            {
                title: 'Label',
                dataIndex: 'key',
                sorter: true,
                key: 'key',
                render: (key, spec) => (
                      <span>{spec.specialty.name}</span>
                  )
            }],
            columnsT: [{
              title: 'Seminar',
              dataIndex: 'seminar',
              sorter: true,
              key: 'seminar',
              render: (seminar) => (
                  <Link to={"/seminar/" + seminar.key}>{seminar.name}</Link>
              )
            },{
              title: 'Contractor',
              dataIndex: 'contractor',
              sorter: true,
              key: 'contractor',
              render: (contractor) => (
                    <Link to={"/contractor/" + contractor.key}>{contractor.name}</Link>
                )
            },{
              title: 'Specialty',
              dataIndex: 'specialty.name',
              sorter: true,
              key: 'specialty',
            },{
              title: 'Grade',
              dataIndex: 'grade',
              key: 'grade',
            },{
              title: 'Passed',
              dataIndex: 'passed',
              key: 'passed',
              render: (passed) => {
                    if (passed)
                        return (<div style={{ color: '#008000' }}>Pass</div>)
                    else
                        return (<div style={{ color: '#FF0000' }}>Fail</div>)
                    
              }
            }],
            isLoading: false,
            trainee: {},
            seminarTrainees: [],
            isEdit: false
        };
        this.getTrainee = this.getTrainee.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
    }


    confirm(trainee) {
        this.remove.bind(this, trainee);
        this.remove(trainee);
        message.success('Removed');
    }

    cancel(e) {
        message.error('Canceled remove');
    }

    remove(trainee){
        let promise;

        //promise = deleteItem(trainee);

        const trainees = this.state.trainees.filter(i => i.key !== trainee.key)
        this.setState({trainees})
    }

    update(){
        this.setState({
            isLoading: true,
            isEdit: false,
        });
        let promise;

        promise = updateItem(this.state.trainee);
        promise
        .then(response => {
            notification.success({
                message: 'Seminar App',
                description: "Sucessfully saved cahnges!",
            }); 
            this.setState({
                isLoading: false,
                isEdit: false
            });
        })
        .catch(error => {
            notification.error({
                message: 'Seminar App',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
            this.setState({
                isLoading: false
            });
        });
    }

    getTrainee(){
        this.setState({
            isLoading: true
        });
        let promise;

        promise = getTraineeById(this.state.id);

        if(!promise) {
            return;
        }
        promise
            .then(response => {

                this.setState({
                    trainee: response,
                    seminarTrainees: response._embedded ? response._embedded.seminarTrainees: [],
                    isLoading: false
                })
            }).catch(error => {
            this.setState({
                isLoading: false
            })
        });
    }

    uploadFile = (file) => {
        this.setState({
            isLoading: true,
        });
        if(!file) {
            notification.error({
                message: 'Seminar App',
                description: 'Please upload a file.'
            });
            return;
        }

        let data = new FormData();
        data.append('image', file);
        data.append('traineeId', this.state.id);
        let me = uploadImage(data);
        if(!me) {
            return;
        }
        me
        .then(response => {
            notification.success({
                message: 'Seminar App',
                description: "Sucessfully uploaded avatar!",
            }); 
            this.getTrainee();
        })
        .catch(error => {
            notification.error({
                message: 'Seminar App',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    };

    handleSelectChange(value, field) {
        const trainee = this.state.trainee;
        trainee[field] = value;
        this.setState({
            trainee: trainee
        });

    }

    handleEdit(){
        this.setState({
            isEdit: !this.state.isEdit
        })
    }

    handleInputChange(event, validationFun) {
        const target = event.target;
        const inputName = target.name;        
        const inputValue = target.value;
        const traineeEdit = this.state.trainee;
        traineeEdit[inputName] = inputValue;

        this.setState({
            trainee: traineeEdit
        });
    }

    componentWillMount() {
        this.getTrainee();
    }


    render() {
        if(this.state.isLoading) {
            return <LoadingIndicator />
        }
        let content;
        if (this.state.isEdit){
            content =(
                    <Form layout="inline" className="trainee-info" onSubmit={this.update.bind(this)}>
                        <Row gutter={16}>
                            <Col span={12}>   
                                <Avatar size={128} src={API_BASE_URL + '/' + this.state.trainee.imageLocation}/>
                            </Col>
                            <Col span={12}>
                                <Upload
                                    className="avatar-uploader"
                                    name="image"
                                    listType="picture-card"
                                    action={this.uploadFile}
                                    showUploadList={false}>
                                    <div>
                                        <Icon type='plus'/>
                                        <div className="ant-upload-text">
                                            Upload new image
                                        </div>
                                    </div>
                                </Upload>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="amaTitle" className="trainee-tag">
                                    AMA: 
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Input defaultValue={this.state.trainee.ama} 
                                        name="ama"
                                        onChange={(event) => this.handleInputChange(event)}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="surnameTitle" className="trainee-tag">
                                    Surname: 
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Input defaultValue={this.state.trainee.surname} 
                                        name="surname"
                                        onChange={(event) => this.handleInputChange(event)}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="nameTitle" className="trainee-tag">
                                    Name: 
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Input 
                                        defaultValue={this.state.trainee.name}  
                                        name="name"
                                        onChange={(event) => this.handleInputChange(event)}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="fathersNameTitle" className="trainee-tag">
                                    Father's Name: 
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Input 
                                        defaultValue={this.state.trainee.fathersName}  
                                        name="fathersName"
                                        onChange={(event) => this.handleInputChange(event)}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="nationalityTitle" className="trainee-tag">
                                    Nationality: 
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Input 
                                        defaultValue={this.state.trainee.nationality}  
                                        name="nationality"
                                        onChange={(event) => this.handleInputChange(event)}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="cardTypeTitle" className="trainee-tag">
                                    Card Type:
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Select 
                                        size="large"
                                        name="cardType"
                                        autoComplete="off"
                                        value={this.state.trainee.cardType}
                                        onChange={(value) => this.handleSelectChange(value, 'cardType')} > 
                                            <Option key="NO_CARD">No card</Option>
                                            <Option key="GREEN">Green</Option>
                                            <Option key="YELLOW">Yellow</Option> 
                                            <Option key="RED">Red</Option>
                                        </Select> 
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="cardStatusTitle" className="trainee-tag">
                                    Card Status:
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Select 
                                        size="large"
                                        name="cardStatus"
                                        autoComplete="off"
                                        value={this.state.trainee.cardStatus}
                                        onChange={(value) => this.handleSelectChange(value, 'cardStatus')} >  
                                            <Option key="NO_CARD">No card</Option>
                                            <Option key="PENDING">Pending</Option>
                                            <Option key="PRINTED">Printed</Option>
                                            <Option key="DELIVERED">Delivered</Option>
                                        </Select> 
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="documentCodeTitle" className="trainee-tag">
                                    Document Code:
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    <Input 
                                        defaultValue={this.state.trainee.documentCode} 
                                        name="documentCode"
                                        onChange={(event) => this.handleInputChange(event)}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="docTypeTitle" className="trainee-tag">
                                    Document Type:
                                </span>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                     <Select 
                                        size="large"
                                        name="docType"
                                        autoComplete="off"
                                        value={this.state.trainee.docType}
                                        onChange={(value) => this.handleSelectChange(value, 'docType')} >  
                                            <Option key="NONE">None</Option>
                                            <Option key="IDENTITY">Identity</Option>
                                            <Option key="DRIVING_LICENSE">Driving License</Option>
                                            <Option key="PASSPORT">Passport</Option>
                                        </Select> 
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="createdTitle" className="trainee-tag">
                                    Created:
                                </span>
                            </Col>
                            <Col span={12}>
                                <span label="created" >
                                    {this.state.trainee.createdBy} at {formatDate(this.state.trainee.createdAt)}
                                </span>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <span label="updatedTitle" className="trainee-tag">
                                    Last edit:
                                </span>
                            </Col>
                            <Col span={12}>
                                <span label="updated" >
                                    {this.state.trainee.updatedBy} at {formatDate(this.state.trainee.updatedAt)}
                                </span>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}/>
                            <Col span={12}>
                                <FormItem>
                                     <Button htmlType="submit" type="primary">
                                        Save
                                    </Button>
                                </FormItem>
                                <FormItem>
                                     <Button type="Submit" type="danger" onClick={this.handleEdit}>
                                        Cancel
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                )
        }else{
            content=(
                <div className="trainee-info">
                    <Avatar size={128} src={API_BASE_URL + '/' + this.state.trainee.imageLocation}/>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="amaTitle" className="trainee-tag">
                                AMA: 
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="ama">
                                {this.state.trainee.ama}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="surnameTitle" className="trainee-tag">
                                Surname: 
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="surname">
                                {this.state.trainee.surname}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="nameTitle" className="trainee-tag">
                                Name: 
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="name">
                                {this.state.trainee.name}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="fathersNameTitle" className="trainee-tag">
                                Father's Name: 
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="fathersName">
                                {this.state.trainee.fathersName}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="nationalityTitle" className="trainee-tag">
                                Nationality: 
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="nationality">
                                {this.state.trainee.nationality}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="cardTypeTitle" className="trainee-tag">
                                Card Type:
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="cardType">
                                {humanize(this.state.trainee.cardType)}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="cardStatusTitle" className="trainee-tag">
                                Card Status:
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="cardStatus">
                                {humanize(this.state.trainee.cardStatus)}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="documentCodeTitle" className="trainee-tag">
                                Document Code:
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="documentCode">
                                {this.state.trainee.documentCode}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="docTypeTitle" className="trainee-tag">
                                Document Type:
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="docType">
                                {humanize(this.state.trainee.docType)}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="createdTitle" className="trainee-tag">
                                Created:
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="created" >
                                {this.state.trainee.createdBy} at {formatDate(this.state.trainee.createdAt)}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <span label="updatedTitle" className="trainee-tag">
                                Last edit:
                            </span>
                        </Col>
                        <Col span={12}>
                            <span label="updated" >
                                {this.state.trainee.updatedBy} at {formatDate(this.state.trainee.updatedAt)}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}/>
                        <Col span={12}>
                            <Button className="edit-trainee-button" type="primary" onClick={this.handleEdit}>Edit</Button>
                        </Col>
                    </Row>
                    </div>
                )
        }
        return (
            <div className="trainee-container">
                <h1 className="page-title">Trainee {this.state.trainee.surname+" "+this.state.trainee.name} </h1>
                <div className="trainee-content">
                        {content}

                    <div className="trainees-list">
                        <Table 
                            {...this.state}
                            title={() => {return ( 
                                <div className="table-header">
                                    <span className="table-title"> Specialties </span>
                                </div> 
                                )}}
                            columns={this.state.columnsT} 
                            dataSource={this.state.seminarTrainees}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
export default withRouter(Trainee);

