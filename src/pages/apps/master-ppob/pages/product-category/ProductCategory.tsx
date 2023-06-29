import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, TextField, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
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
import { Controller, useForm } from 'react-hook-form';
import { Confirmation, ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewProductCategoryData,
  changeMasterProductCategoryReducer,
  deleteProductCategoryData,
  editProductCategoryData,
  getMasterProductCategoryData,
  getProductCategoryDetailData,
} from 'src/store/actions/masters-action/product-category-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

// const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

const productCategorySchema = yup.object().shape({
  nama: yup.string().required('Name is required'),
  id: yup.string().required('ID is required'),
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
  nama: string;
  keterangan: string;
  deleted: boolean;
  index: number;
}

function createData(id: number, nama: string, keterangan: string, deleted: boolean, index: number): Data {
  return {
    id,
    nama,
    keterangan,
    deleted,
    index,
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
    disableSort: false,
  },
  {
    id: 'nama',
    disablePadding: false,
    label: 'Name',
    disableSort: false,
  },
  {
    id: 'keterangan',
    disablePadding: false,
    label: 'Keterangan',
    disableSort: true,
  },
  {
    id: 'deleted',
    disablePadding: false,
    label: 'Tersedia',
    align: 'center',
    disableSort: false,
  },
  {
    id: 'index',
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
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
  id: string;
  nama: string;
  keterangan: string;
};

const ProductCategory = () => {
  const dispatch = useAppDispatch();
  const { data, page, sortBy, sortType, limit, total, search, loadingPost, loadingDelete, loading, error } =
    useAppSelector((state) => state.masterProductCategoryReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [openImagePreview, setOpenImagePreview] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: '',
      nama: '',
      keterangan: '',
    },
    resolver: yupResolver(productCategorySchema),
  });

  const { control, formState, handleSubmit, reset } = formMethods;
  const { errors } = formState;

  const handleClickOpen = () => {
    setOpenFormDialog(true);
  };
  const handleClose = () => {
    if (editForm) {
      setEditForm(false);
    }
    setOpenFormDialog(false);
    reset({
      id: '',
      nama: '',
      keterangan: '',
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      id: formData.id,
      nama: formData.nama,
      keterangan: formData.keterangan,
    };

    if (editForm) {
      const response = await dispatch(editProductCategoryData(formData?.id, payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterProductCategoryData());
      }
    } else {
      const response = await dispatch(addNewProductCategoryData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getMasterProductCategoryData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getMasterProductCategoryData());
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
        dispatch(getMasterProductCategoryData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data, index) => createData(row?.id, row?.nama, row?.keterangan, row?.deleted, index));

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterProductCategoryReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getMasterProductCategoryData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterProductCategoryReducer({
          page: newPage,
        }),
      );
      dispatch(getMasterProductCategoryData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeMasterProductCategoryReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getMasterProductCategoryData());
  };

  const handleDeleteData = async (id: number) => {
    const response = await dispatch(deleteProductCategoryData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getMasterProductCategoryData());
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
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              dispatch(
                changeMasterProductCategoryReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeMasterProductCategoryReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getMasterProductCategoryData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Kategori Produk
            </Typography>
            <Typography variant="body1">Manajemen daftar kategori produk</Typography>
          </div>
          <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
            Tambah Data
          </Button>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(
                  changeMasterProductCategoryReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getMasterProductCategoryData());
              }}
            />
          ) : rows?.length === 0 ? (
            <EmptyTableView />
          ) : (
            <Paper sx={{ width: '100%' }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
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
                          <TableCell align="left" component="th" id={labelId} scope="row">
                            {row.id}
                          </TableCell>
                          <TableCell align="left">{row.nama || '-'}</TableCell>
                          <TableCell align="left">{row.keterangan || '-'}</TableCell>
                          <TableCell align="center">
                            {!row.deleted ? (
                              <CheckCircleIcon titleAccess="Tersedia" fontSize="small" color="success" />
                            ) : (
                              <CancelIcon titleAccess="Dihapus" fontSize="small" color="error" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <section className="flex items-center justify-center gap-2">
                              <Tooltip title="Hapus">
                                <span>
                                  <IconButton
                                    onClick={() => {
                                      setSelectedId(row.id);
                                      setOpenDeleteConfirmation(true);
                                    }}
                                    size="small"
                                    aria-label="delete"
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <span>
                                  <IconButton
                                    onClick={async () => {
                                      const response: any = await dispatch(getProductCategoryDetailData(row.id));
                                      if (typeof response === 'object' && Object.keys(response).length > 0) {
                                        setSelectedId(response?.id);
                                        setEditForm(true);
                                        reset({
                                          id: response?.id,
                                          nama: response?.nama || '',
                                          keterangan: response?.keterangan || '',
                                        });
                                        handleClickOpen();
                                      }
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <Edit fontSize="small" />
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
          )}
        </section>
      </main>
      {openFormDialog && (
        <BootstrapDialog aria-labelledby="customized-dialog-title" open={openFormDialog} maxWidth="md" fullWidth>
          <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
            {editForm ? 'Edit Data Kategori Produk' : 'Data Kategori Produk Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <div className="flex flex-col items-stretch gap-4 w-full">
              <Controller
                control={control}
                name="id"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">ID</label>
                    <TextField
                      {...field}
                      disabled={editForm}
                      fullWidth
                      placeholder="Category ID"
                      helperText={errors?.id && errors.id?.message}
                      error={!!errors?.id}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="nama"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">Name</label>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Product category name"
                      helperText={errors?.nama && errors.nama?.message}
                      error={!!errors?.nama}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="keterangan"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">Notes</label>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Notes"
                      helperText={errors?.keterangan && errors.keterangan?.message}
                      error={!!errors?.keterangan}
                    />
                  </div>
                )}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button disabled={loadingPost} color="inherit" onClick={handleClose}>
              Batal
            </Button>
            <Button
              disabled={loadingPost}
              variant="contained"
              onClick={() => {
                if (editForm) {
                  handleEditConfirmation();
                } else {
                  onSubmit();
                }
              }}
            >
              Simpan
            </Button>
          </DialogActions>
        </BootstrapDialog>
      )}
      {openDeleteConfirmation && (
        <Confirmation
          open={openDeleteConfirmation}
          title={'Hapus data kategori produk?'}
          content={`Konfirmasi untuk menghapus data kategori produk dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenDeleteConfirmation(false)}
          confirmActionHandler={() => handleDeleteData(selectedId || 0)}
          loading={loadingDelete || false}
          loadingText={'Menghapus'}
          confirmActionText={'Hapus'}
          cancelActionText={'Batal'}
          type="error"
        />
      )}
      {openEditConfirmation && (
        <Confirmation
          open={openEditConfirmation}
          title={'Ubah data kategori produk?'}
          content={`Konfirmasi untuk mengubah data kategori produk dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenEditConfirmation(false)}
          confirmActionHandler={onSubmit}
          loading={loadingPost || false}
          loadingText={'Mengubah'}
          confirmActionText={'OK'}
          cancelActionText={'Batal'}
          type="primary"
        />
      )}
      {openImagePreview && (
        <BootstrapDialog
          onClose={() => {
            setSelectedImagePreview('');
            setOpenImagePreview(false);
          }}
          aria-labelledby="customized-dialog-title"
          open={openImagePreview}
          maxWidth="sm"
          fullWidth
        >
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={() => {
              setSelectedImagePreview('');
              setOpenImagePreview(false);
            }}
          >
            {'Image Preview'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex flex-col items-center justify-center h-[240px]">
              <img alt="preview" className="w-full h-full p-1 object-scale-down" src={selectedImagePreview} />
            </section>
          </DialogContent>
        </BootstrapDialog>
      )}
    </>
  );
};

export default ProductCategory;
