import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import React, { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
    changeMasterMenuReducer,
    getMasterMenuData,
} from 'src/store/actions/masters-action/menu-action';

interface Column {
    id: 'id' | 'title' | 'icon' | 'link' | 'deleted' | 'parent_id' | 'created_who' | 'updated_who';
    label: string;
    minWidth?: number;
    align?: 'right' | 'center' | 'left';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: 'id', label: 'ID', align: 'center' },
    { id: 'title', label: 'Title', align: 'left' },
    { id: 'icon', label: 'Icon', align: 'left' },
    { id: 'link', label: 'Link', align: 'left' },
    { id: 'deleted', label: 'Available', align: 'center' },
    { id: 'parent_id', label: 'Parent ID', align: 'center' },
    { id: 'created_who', label: 'Created Who', align: 'left' },
    { id: 'updated_who', label: 'Updated Who', align: 'left' },
    { id: 'id', label: 'Action', align: 'center' },
];

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

const MasterMenu = () => {
    const dispatch = useAppDispatch();
    const { data, loading, error, total, limit, page } = useAppSelector(
        (state) => state.masterMenuReducer
    );
    const isMount = useRef<boolean>(true);

    const handleChangePage = (event: unknown, newPage: number) => {
        dispatch(
            changeMasterMenuReducer({
                page: newPage,
            })
        );
        dispatch(getMasterMenuData());
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(
            changeMasterMenuReducer({
                page: 0,
                limit: +event.target.value,
            })
        );
        dispatch(getMasterMenuData());
    };

    const handleGetData = useCallback(async () => {
        dispatch(getMasterMenuData());
    }, [dispatch]);

    useEffect(() => {
        if (isMount.current) {
            handleGetData();
            isMount.current = false;
        }
    }, [handleGetData]);

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

    return (
        <>
            <section className="p-4 bg-gray-200 w-full rounded-md">
                <div className="flex flex-col xl:flex-row gap-4">
                    <input
                        className="rounded-md px-3 py-2 border-2 border-gray-600 w-full"
                        type="text"
                        placeholder="Cari nama menu"
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
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows?.map((row) => {
                                        return (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={row.id}
                                            >
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell
                                                            key={column.id}
                                                            align={column.align}
                                                        >
                                                            {column?.label === 'Action' ? (
                                                                <div className="flex items-center gap-4">
                                                                    <button>🗑️</button>
                                                                    <button>✏️</button>
                                                                </div>
                                                            ) : column.format &&
                                                              typeof value === 'number' ? (
                                                                column.format(value)
                                                            ) : column.id === 'deleted' ? (
                                                                !value ? (
                                                                    '✅'
                                                                ) : (
                                                                    '❌'
                                                                )
                                                            ) : (
                                                                value || '-'
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 100]}
                            component="div"
                            count={total || 0}
                            rowsPerPage={limit || 10}
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
