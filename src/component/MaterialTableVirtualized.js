import * as React from 'react';
import {useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {withStyles} from '@mui/styles';
import {createTheme} from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import AddBox from '@mui/icons-material/AddBox';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import {AutoSizer, Column, Table, defaultTableRowRenderer} from 'react-virtualized';
import {containerData, DEFAULT_DISPLAY_COLUMNS} from "./MaterialTableVirtualizedHelperUtil";
import Popover from "@mui/material/Popover";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ExpandedTable from './MaterialTable';

const styles = (theme) => ({
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    table: {
        // temporary right-to-left patch, waiting for
        // https://github.com/bvaughn/react-virtualized/issues/454
        '& .ReactVirtualized__Table__headerRow': {
            ...(theme.direction === 'rtl' && {
                paddingLeft: '0 !important',
            }),
            ...(theme.direction !== 'rtl' && {
                paddingRight: undefined,
            }),
        },
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    tableCell: {
        flex: 1,
    },
    noClick: {
        cursor: 'initial',
    },
});

class MuiVirtualizedTable extends React.Component {
    static defaultProps = {
        headerHeight: 48,
        rowHeight: 50,
        selected: {},
    };

    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.tableRef) {
            this.tableRef.current.recomputeRowHeights();
            this.tableRef.current.forceUpdate();
        }
    }

    getRowClassName = ({ index }) => {
        const { classes, onRowClick } = this.props;

        return clsx(classes.tableRow, classes.flexContainer, {
            [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
    };

    cellRenderer = ({ cellData }) => {
        const { classes, rowHeight, onRowClick } = this.props;
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, {
                    [classes.noClick]: onRowClick == null,
                })}
                variant="body"
                style={{ height: rowHeight }}
            >
                {cellData}
            </TableCell>
        );
    };

    handleSelectAll = (event) => {
        const { onSelectRow } = this.props;
        const selected = {};
        if (event.target.checked) {
            rows.forEach(r => selected[r.id] = true);
        }
        onSelectRow(selected);
    };

    handleSelectRow = (event, rowId) => {
        const { selected, onSelectRow } = this.props;
        const newSelected = { ...selected };
        if (event.target.checked) {
            newSelected[rowId] = true;
        } else {
            delete newSelected[rowId];
        }
        onSelectRow(newSelected);
    };

    checkboxHeaderRenderer = ({ cellData, index }) => {
        const { classes, rowHeight, selected, rowCount } = this.props;
        let selectedRowsCount = Object.keys(selected).length;
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer)}
                variant="body"
                style={{ height: rowHeight }}
                padding="checkbox"
            >
                <Checkbox
                    color="primary"
                    indeterminate={selectedRowsCount > 0 && selectedRowsCount !== rowCount}
                    checked={selectedRowsCount === rowCount}
                    onChange={this.handleSelectAll}
                    inputProps={{
                        'aria-label': 'select-all',
                    }}
                />
            </TableCell>
        );
    };

    checkboxCellRenderer = ({ cellData, index }) => {
        const { classes, rowHeight, selected } = this.props;
        const labelId = `enhanced-table-checkbox-${index}`;
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer)}
                variant="body"
                style={{ height: rowHeight }}
                padding="checkbox"
            >
                <Checkbox
                    color="primary"
                    checked={!!selected[cellData]}
                    onChange={(e) => this.handleSelectRow(e, cellData)}
                    inputProps={{
                        'aria-label': labelId,
                    }}
                />
            </TableCell>
        );
    };

    headerRenderer = ({ label, columnIndex }) => {
        const { headerHeight, classes } = this.props;

        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
                variant="head"
                style={{ height: headerHeight }}
            >
                <span>{label}</span>
            </TableCell>
        );
    };

    renderRow = (rowProps) => {
        const { style, className, key, rowData } = rowProps;
        const { expanded } = this.props;
        console.log('vinay render row', expanded, rowData);
        if (expanded[rowData.id]) {
            return (
                <div
                    style={{ ...style, display: "flex", flexDirection: "column" }}
                    className={className}
                    key={key}
                >
                    {defaultTableRowRenderer({
                        ...rowProps,
                        expanded,
                        style: { width: style.width, height: 500 }
                    })}
                    <div
                        style={{
                            marginRight: "auto",
                            marginLeft: 80,
                            height: 500,
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <ExpandedTable />
                    </div>
                </div>
            );
        }
        return defaultTableRowRenderer(rowProps);
    }

    renderColumnExpandable = () => {
        const { classes, rowHeight, expanded, onExpandRow } = this.props;
        return (
            <Column
                key="col-expandable"
                width={50}
                headerRenderer={() => {
                    return (
                        <TableCell
                            component="div"
                            className={clsx(classes.tableCell, classes.flexContainer)}
                            variant="body"
                            style={{ height: rowHeight }}
                            padding="checkbox"
                        />
                    );
                }}
                className={classes.flexContainer}
                cellRenderer={({ cellData }) => {
                    return (
                        <TableCell
                            component="div"
                            className={clsx(classes.tableCell, classes.flexContainer)}
                            variant="body"
                            style={{ height: rowHeight }}
                            padding="checkbox"
                        >
                            <IconButton
                                aria-label="more"
                                id="expand-button"
                                aria-haspopup="true"
                                onClick={() => {
                                    const newExpanded = { ...expanded };
                                    if (newExpanded[cellData]) {
                                        delete newExpanded[cellData];
                                    } else {
                                        newExpanded[cellData] = true;
                                    }
                                    onExpandRow(newExpanded);
                                }}
                            >
                                { expanded[cellData] ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </TableCell>
                    );
                }}
                dataKey="id"
            />
        );
    };

    render() {
        console.log('vinay props', this.props);
        const { classes, displayColumns, columns,
            rowHeight, headerHeight, expanded,
            ...tableProps } = this.props;
        const columnsToRender = columns.filter(c => displayColumns.includes(c.id));
        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        height={height}
                        width={width}
                        rowHeight={({ index }) => {
                            return expanded[rows[index].id] ? 500 : rowHeight
                        }}
                        gridStyle={{
                            direction: 'inherit',
                        }}
                        headerHeight={headerHeight}
                        className={classes.table}
                        {...tableProps}
                        rowClassName={this.getRowClassName}
                        rowRenderer={this.renderRow}
                        ref={this.tableRef}
                    >
                        <Column
                            key="col-checkbox"
                            width={50}
                            headerRenderer={this.checkboxHeaderRenderer}
                            className={classes.flexContainer}
                            cellRenderer={this.checkboxCellRenderer}
                            dataKey="id"
                        />
                        {this.renderColumnExpandable()}
                        {columnsToRender.map(({ dataKey, ...other }, index) => {
                            return (
                                <Column
                                    key={dataKey}
                                    headerRenderer={(headerProps) =>
                                        this.headerRenderer({
                                            ...headerProps,
                                            columnIndex: index,
                                        })
                                    }
                                    className={classes.flexContainer}
                                    cellRenderer={this.cellRenderer}
                                    dataKey={dataKey}
                                    {...other}
                                />
                            );
                        })}
                    </Table>
                )}
            </AutoSizer>
        )
    }
}

const ColumnShape = PropTypes.shape({
    dataKey: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    numeric: PropTypes.bool,
    width: PropTypes.number.isRequired,
});

MuiVirtualizedTable.propTypes = {
    classes: PropTypes.object.isRequired,
    columns: PropTypes.arrayOf(ColumnShape).isRequired,
    headerHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    rowHeight: PropTypes.number,
    selected: PropTypes.object,
    onSelectRow: PropTypes.func,
    displayColumns: PropTypes.array,
    setDisplayColumns: PropTypes.func,
    expanded: PropTypes.object,
    onExpandRow: PropTypes.func,
};

const defaultTheme = createTheme();
const VirtualizedTable = withStyles(styles, { defaultTheme })(MuiVirtualizedTable);

// ---

const ButtonDropDownMultiSelect = ({ options, selected, onSelect }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (event, option) => {
        let newSelected = [...selected];
        if (event.target.checked) {
            newSelected.push(option.id);
        } else {
            newSelected = newSelected.filter(s => s === option.id);
        }
        onSelect(newSelected);
    };
    return (
        <>
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                <AddBox />
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <FormGroup>
                    {options.map((option) => (
                        <FormControlLabel
                            key={option.id}
                            checked={selected.includes(option.id)}
                            onChange={(e) => handleSelect(e, option)}
                            control={<Checkbox />}
                            label={option.label}
                        />
                    ))}
                </FormGroup>
            </Popover>
        </>
    );
}

const {
    columns,
    data: rows
} = containerData;

export default function ReactVirtualizedTable() {
    const [selected, setSelected] = useState({});
    const [expanded, setExpanded] = useState({});
    const [displayColumns, setDisplayColumns] = useState([...DEFAULT_DISPLAY_COLUMNS]);
    console.log('vinay col', displayColumns);
    return (
        <Paper style={{ width: '100%' }}>
            <div>
                <ButtonDropDownMultiSelect
                    options={columns.map((c) => ({ id: c.id, label: c.label }))}
                    selected={displayColumns}
                    onSelect={setDisplayColumns}
                />
            </div>
            <div style={{ height: 800, width: '100%' }}>
                <VirtualizedTable
                    rowCount={rows.length}
                    rowGetter={({ index }) => rows[index]}
                    selected={selected}
                    onSelectRow={setSelected}
                    columns={columns}
                    displayColumns={displayColumns}
                    setDisplayColumns={setDisplayColumns}
                    onRowClick={() => {}}
                    expanded={expanded}
                    onExpandRow={setExpanded}
                />
            </div>
        </Paper>
    );
}
