import moment from 'moment';

function dateFormatter(params) {
    if (params.value) {
        return moment(params.value).format('YYYY-MM-DD HH:mm:ss');
    }
    return params.value;
}


function imageRenderer(params) {
    if (params.value) {
        return `<img style="height: 100%" src="${params.value}"/>`;
    }
    return params.value;
}

function linkRenderer(params) {
    if (params.value) {
        return `<a href="${params.value}" target="_blank">${params.value}</a>`;
    }
    return params.value;
}

const ColumnTypes = {
    dateColumn: {
        filter: 'agDateColumnFilter',
        valueFormatter: dateFormatter
    },
    numberColumn: {
        width: 120 
    },
    imageColumn: {
        cellRenderer: imageRenderer
    },
    linkColumn: {
        cellRenderer: linkRenderer
    }
}

export { ColumnTypes }