import { yupResolver } from '@hookform/resolvers/yup';
import { Info } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {
    DialogContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tooltip,
    Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { currencyFormat } from 'src/helpers/utils/helpers';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { deleteMenuData } from 'src/store/actions/masters-action/menu-action';
import {
    handleGetSaldoMutationData,
    handleGetSaldoMutationDetailData,
} from 'src/store/actions/transaction-action/saldo-mutation-action';
import {
    setSaldoMutationLimit,
    setSaldoMutationPage,
    setSaldoMutationResetDetailData,
    setSaldoMutationResetState,
    setSaldoMutationSearchData,
    setSaldoMutationSortBy,
    setSaldoMutationSortType,
} from 'src/store/slices/transaction-slice/saldo-mutation-slice';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const menuSchema = yup.object().shape({
    nominal: yup.string().required('Title is required'),
    total_bayar: yup.string().required('Link is required'),
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
}

interface Data {
    id: number;
    keterangan: string;
    produk_name: string;
    user_debit_id: number;
    user_debit_name: string;
    user_kredit_id: number;
    user_kredit_name: string;
    created_date: string;
}

function createData(
    id: number,
    keterangan: string,
    produk_name: string,
    user_debit_id: number,
    user_debit_name: string,
    user_kredit_id: number,
    user_kredit_name: string,
    created_date: string,
): Data {
    return {
        id,
        keterangan,
        produk_name,
        user_debit_id,
        user_debit_name,
        user_kredit_id,
        user_kredit_name,
        created_date,
    };
}

type Order = 'asc' | 'desc';

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
        id: 'produk_name',
        disablePadding: false,
        label: 'Produk',
        disableSort: false,
    },
    {
        id: 'user_debit_id',
        disablePadding: false,
        label: 'ID Debit',
        disableSort: false,
        align: 'center',
    },
    {
        id: 'user_debit_name',
        disablePadding: false,
        label: 'Debit',
        disableSort: false,
    },
    {
        id: 'user_kredit_id',
        disablePadding: false,
        label: 'ID Kredit',
        disableSort: false,
        align: 'center',
    },
    {
        id: 'user_kredit_name',
        disablePadding: false,
        label: 'Debit',
        disableSort: false,
    },
    {
        id: 'created_date',
        disablePadding: false,
        label: 'Created Date',
        disableSort: false,
    },
    {
        id: 'keterangan',
        disablePadding: false,
        label: 'Keterangan',
        disableSort: false,
    },
    // {
    //   id: 'id',
    //   disablePadding: false,
    //   label: 'Action',
    //   align: 'center',
    //   disableSort: true,
    // },
];

interface EnhancedTableProps {
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        newOrderBy: keyof Data
    ) => void;
    order: Order;
    orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler =
        (newOrderBy: keyof Data) => (event: React.MouseEvent<unknown>) => {
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

type FormType = {
    id: number;
    nominal: number;
    user_id: null | { id: number; nominal: string };
    admin_nominal: number;
    total_bayar: number;
};

const SaldoMutation = () => {
    const dispatch = useAppDispatch();
    const {
        data,
        page,
        sortBy,
        sortType,
        limit,
        total,
        search,
        loading,
        error,
        loadingDetail,
        detailData,
    } = useAppSelector((state) => state.saldoMutationReducer);
    const isMount = useRef<boolean>(true);

    const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [openDeleteConfirmation, setOpenDeleteConfirmation] =
        useState<boolean>(false);
    const [openEditConfirmation, setOpenEditConfirmation] =
        useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const formMethods = useForm<FormType>({
        mode: 'onChange',
        defaultValues: {
            id: 0,
            nominal: 0,
            user_id: null,
            admin_nominal: 0,
            total_bayar: 0,
        },
        resolver: yupResolver(menuSchema),
    });

    const { control, formState, handleSubmit, reset } = formMethods;
    const { errors } = formState;

    const handleClickOpen = () => {
        setOpenDialog(true);
    };
    const handleClose = () => {
        setOpenDialog(false);
        dispatch(setSaldoMutationResetDetailData());
    };

    const handleEditConfirmation = handleSubmit(() => {
        setOpenEditConfirmation(true);
    });

    const handleGetData = useCallback(async () => {
        dispatch(handleGetSaldoMutationData());
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
                dispatch(handleGetSaldoMutationData());
            }
        },
        [debouncedSearchTerm] // Only call effect if debounced search term changes
    );

    const rows = data?.map((row: Data) =>
        createData(
            row?.id,
            row?.keterangan,
            row?.produk_name,
            row?.user_debit_id,
            row?.user_debit_name,
            row?.user_kredit_id,
            row?.user_kredit_name,
            row?.created_date
        )
    );

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
            const isAsc = sortBy === newOrderBy && sortType === 'asc';
            const toggledOrder = isAsc ? 'desc' : 'asc';
            dispatch(setSaldoMutationSortBy(newOrderBy));
            dispatch(setSaldoMutationSortType(toggledOrder));

            dispatch(handleGetSaldoMutationData());
        },

        [sortType, sortBy, dispatch]
    );

    const handleChangePage = React.useCallback(
        (event: unknown, newPage: number) => {
            dispatch(setSaldoMutationPage(newPage));
            dispatch(handleGetSaldoMutationData());
        },
        [dispatch, page]
    );

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatch(setSaldoMutationPage(0));
        dispatch(setSaldoMutationLimit(+event.target.value));

        dispatch(handleGetSaldoMutationData());
    };

    const handleDeleteData = async (id: number) => {
        const response = await dispatch(deleteMenuData(id));
        if (response) {
            dispatch(handleGetSaldoMutationData());
            setOpenDeleteConfirmation(false);
            setSelectedId(null);
        }
    };

    return (
        <>
            <section className="p-4 bg-gray-200 w-full rounded-md">
                <div className="flex flex-col xl:flex-row gap-4">
                    <input
                        className="rounded-md px-3 py-2 border-2 border-gray-600 w-full"
                        type="search"
                        placeholder="Cari data..."
                        onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            dispatch(
                                setSaldoMutationSearchData((e.target as HTMLInputElement).value)
                            )
                        }
                    />
                </div>
            </section>
            <main className="flex flex-col gap-6">
                <div className="flex justify-between gap-4 items-center">
                    <div>
                        <Typography fontWeight={'bold'} variant="h6">
                            Daftar Mutasi
                        </Typography>
                        <Typography variant="body1">Manajemen daftar mutasi</Typography>
                    </div>
                </div>
                <section>
                    {loading ? (
                        <Loading />
                    ) : error ? (
                        <ErrorView
                            message={error || ''}
                            handleRetry={() => {
                                dispatch(setSaldoMutationResetState());
                                dispatch(handleGetSaldoMutationData());
                            }}
                        />
                    ) : rows?.length === 0 ? (
                        <EmptyTableView />
                    ) : (
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
                                                        {row.produk_name || '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {row.user_debit_id || '-'}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row.user_debit_name || '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {row.user_kredit_id || '-'}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row.user_kredit_name || '-'}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row.created_date || '-'}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row.keterangan || '-'}
                                                    </TableCell>
                                                    {/* <TableCell align="center">
                            <section className="flex items-center gap-2">
                              <Tooltip title="Detail">
                                <span>
                                  <IconButton
                                    disabled={loadingDetail}
                                    color="info"
                                    onClick={async () => {
                                      const response = await dispatch(
                                        handleGetSaldoMutationDetailData(row.id)
                                      );

                                      if (
                                        typeof response === 'boolean' &&
                                        response
                                      ) {
                                        handleClickOpen();
                                      }
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <Info fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </section>
                          </TableCell> */}
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
                    )}
                </section>
            </main>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={openDialog}
                maxWidth="sm"
                fullWidth
            >
                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleClose}
                >
                    Detail Mutasi
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <section>
                        <List dense>
                            <ListItem>
                                <ListItemText primary="ID" secondary={detailData?.id ?? '-'} />
                            </ListItem>

                            <ListItem>
                                <ListItemText
                                    primary="Produk"
                                    secondary={detailData?.produk_name ?? '-'}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemText
                                    primary="Keterangan"
                                    secondary={detailData?.keterangan ?? '-'}
                                />
                            </ListItem>

                        </List>
                    </section>
                </DialogContent>
            </BootstrapDialog>
        </>
    );
};

export default SaldoMutation;