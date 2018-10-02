import React, { Component } from 'react';
import { getAllSeminars, getUserCreatedSeminars, getUserVotedSeminars } from '../util/APIUtils';
import Seminar from './Seminar';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, Icon, notification } from 'antd';
import { SEMINAR_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './SeminarList.css';
import { Table } from 'antd';
import { formatDateTime } from '../util/Helpers';

class SeminarList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns : [{
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
            }, {
              title: 'Date',
              dataIndex: 'date',
              key: 'date',
              render: (date) => (
                formatDateTime(date)
              )
            }, {
              title: 'Type',
              dataIndex: 'seminarType',
              key: 'seminarType',
            }, {
              title: 'Created by',
              dataIndex: 'createdBy',
              key: 'createdBy',
            }, {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (createdAt) => (
                 formatDateTime(createdAt)
              )
            }, {
              title: 'Updated by',
              dataIndex: 'updatedBy',
              key: 'updatedBy',
            }, {
              title: 'Updated at',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              render: (updatedAt) => (
                 formatDateTime(updatedAt)
              )
            }],
            seminars: [],
            isLoading: false,
            pagination: {},
        };
        this.loadSeminarList = this.loadSeminarList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    loadSeminarList(page = 1, size = SEMINAR_LIST_SIZE) {
        let promise;

        promise = getAllSeminars(page -1 , size);

        if(!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });

        promise
            .then(response => {
                const seminars = this.state.seminars.slice();
                const pagination = this.state.pagination;
                pagination.pageSize = response.page.size;
                pagination.total = response.page.totalElements;
                this.setState({
                    seminars: response._embedded.seminars,
                    isLoading: false,
                    pagination: pagination
                })
            }).catch(error => {
            this.setState({
                isLoading: false
            })
        });

    }

    componentWillMount() {
        this.loadSeminarList();
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.isAuthenticated !== nextProps.isAuthenticated) {
            // Reset State
            this.setState({
                seminars: [],
                isLoading: false
            });
            this.loadSeminarList();
        }
    }

    handleLoadMore(pagination) {
        const pager = this.state.pagination;
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });     
        this.loadSeminarList(this.state.pagination.current);
    }

    render() {
        return (
            <div className="seminarList-container">
                <h1 className="page-title">Seminars</h1>
                <div className="seminarList-content">
                    <Table 
                        columns={this.state.columns} 
                        dataSource={this.state.seminars} 
                        loading={this.state.isLoading}
                        pagination={this.state.pagination}
                        onChange={this.handleLoadMore}
                    />
                </div>
            </div>
        );    

    }
}

export default withRouter(SeminarList);