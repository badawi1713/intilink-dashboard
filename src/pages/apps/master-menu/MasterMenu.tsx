import { Delete, Edit } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { IconButton, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import React, { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
    changeMasterMenuReducer,
    getMasterMenuData,
} from 'src/store/actions/masters-action/menu-action';
import { useDebounce } from 'usehooks-ts';
interface Data {
    id: number;
    title: string;
    icon: string;
    link: string;
    deleted: boolean;
    parent_id: number;
    created_who: string;
    updated_who?: string;
}

function createData(
    id: number,
    title: string,
    icon: string,
    link: string,
    deleted: boolean,
    parent_id: number,
    created_who: string,
    updated_who?: string
): Data {
    return { id, title, icon, link, deleted, parent_id, created_who, updated_who };
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    align?: 'left' | 'right' | 'center';
    disableSort: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'id',
        disablePadding: true,
        label: 'ID',
        align: 'center',
        disableSort: false,
    },
    {
        id: 'title',
        disablePadding: false,
        label: 'Title',
        disableSort: false,
    },
    {
        id: 'link',
        disablePadding: false,
        label: 'Link',
        disableSort: false,
    },
    {
        id: 'icon',
        disablePadding: false,
        label: 'Icon',
        disableSort: false,
    },
    {
        id: 'deleted',
        disablePadding: false,
        label: 'Available',
        align: 'center',
        disableSort: false,
    },
    {
        id: 'created_who',
        disablePadding: false,
        label: 'Created By',
        disableSort: false,
    },
    {
        id: 'updated_who',
        disablePadding: false,
        label: 'Updated By',
        disableSort: false,
    },
    {
        id: 'id',
        disablePadding: false,
        label: 'Action',
        align: 'center',
        disableSort: true,
    },
];

interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => void;
    order: Order;
    orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (newOrderBy: keyof Data) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, newOrderBy);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.label}
                        align={headCell.align || 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        {!headCell.disableSort ? (
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {!headCell.disableSort && orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc'
                                            ? 'sorted descending'
                                            : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        ) : (
                            headCell.label
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

const MasterMenu = () => {
    const dispatch = useAppDispatch();
    const { data, page, sortBy, sortType, limit, total, search } = useAppSelector(
        (state) => state.masterMenuReducer
    );
    const isMount = useRef<boolean>(true);

    const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

    const handleGetData = useCallback(async () => {
        dispatch(getMasterMenuData());
    }, [dispatch]);

    useEffect(() => {
        if (isMount.current) {
            handleGetData();
            isMount.current = false;
        }
    }, [handleGetData]);

    useEffect(
        () => {
            if (debouncedSearchTerm) {
                dispatch(getMasterMenuData());
            } else {
                dispatch(getMasterMenuData());
            }
        },
        [debouncedSearchTerm] // Only call effect if debounced search term changes
    );

    const rows = data?.map((row: Data) =>
        createData(
            row?.id,
            row?.title,
            row?.icon,
            row?.link,
            row?.deleted,
            row?.parent_id,
            row?.created_who,
            row?.updated_who
        )
    );

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
            const isAsc = sortBy === newOrderBy && sortType === 'asc';
            const toggledOrder = isAsc ? 'desc' : 'asc';

            dispatch(
                changeMasterMenuReducer({
                    sortBy: newOrderBy,
                    sortType: toggledOrder,
                })
            );
            dispatch(getMasterMenuData());
        },

        [sortType, sortBy, dispatch]
    );

    const handleChangePage = React.useCallback(
        (event: unknown, newPage: number) => {
            dispatch(
                changeMasterMenuReducer({
                    page: newPage,
                })
            );
            dispatch(getMasterMenuData());
        },
        [dispatch]
    );

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(
            changeMasterMenuReducer({
                page: 0,
                limit: +event.target.value,
            })
        );
        dispatch(getMasterMenuData());
    };

    return (
        <>
            <section className="p-4 bg-gray-200 w-full rounded-md">
                <div className="flex flex-col xl:flex-row gap-4">
                    <input
                        className="rounded-md px-3 py-2 border-2 border-gray-600 w-full"
                        type="search"
                        placeholder="Cari nama menu"
                        onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            dispatch(
                                changeMasterMenuReducer({
                                    search: (e.target as HTMLInputElement).value,
                                })
                            )
                        }
                    />
                </div>
            </section>
            <main className="flex flex-col gap-6">
                <div className="flex justify-between gap-4 items-center">
                    <div>
                        <h3 className="font-bold text-xl">Master Menu</h3>
                        <h6 className="text-lg">Manajemen daftar menu</h6>
                    </div>
                    <button className="w-auto bg-blue-600 border-2 border-blue-600 px-3 py-2 rounded-md text-white text-center text-sm font-semibold">
                        Tambah Data
                    </button>
                </div>
                <section>
                    <Paper sx={{ width: '100%' }}>
                        <TableContainer>
                            <Table
                                sx={{ minWidth: 750 }}
                                aria-labelledby="tableTitle"
                                size={'medium'}
                            >
                                <EnhancedTableHead
                                    order={sortType || 'asc'}
                                    orderBy={sortBy || 'deleted'}
                                    onRequestSort={handleRequestSort}
                                />
                                <TableBody>
                                    {rows?.map((row, index) => {
                                        const labelId = `enhanced-table-checkbox-${index}`;

                                        return (
                                            <TableRow hover tabIndex={-1} key={row.id}>
                                                <TableCell
                                                    align="center"
                                                    component="th"
                                                    id={labelId}
                                                    scope="row"
                                                >
                                                    {row.id}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.title || '-'}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.link || '-'}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.icon || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {!row.deleted ? (
                                                        <CheckCircleIcon
                                                            titleAccess="Tersedia"
                                                            fontSize="small"
                                                            color="success"
                                                        />
                                                    ) : (
                                                        <CancelIcon
                                                            titleAccess="Dihapus"
                                                            fontSize="small"
                                                            color="error"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.created_who || '-'}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.updated_who || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <section className="flex items-center gap-2">
                                                        <Tooltip title="Hapus">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    aria-label="delete"
                                                                    color="error"
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title="Edit">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    aria-label="edit"
                                                                >
                                                                    <Edit />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </section>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={total || 0}
                            rowsPerPage={limit || 5}
                            page={page || 0}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </section>
            </main>
        </>
    );
};

export default MasterMenu;
