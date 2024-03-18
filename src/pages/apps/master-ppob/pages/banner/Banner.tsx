import { yupResolver } from '@hookform/resolvers/yup';
import { BrokenImage, Delete, Edit, ImageSearchOutlined } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
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
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Confirmation, ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewBannerData,
  changeBannerReducer,
  deleteBannerData,
  editBannerData,
  getBannerData,
} from 'src/store/actions/masters-action/banner-action';
import { showMessage } from 'src/store/slices/toast-message-slice';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const typeList = [
  {
    id: 'gambar',
    name: 'Gambar',
  },
  {
    id: 'tfsaldo',
    name: 'Transfer Saldo',
  },
  {
    id: 'baper',
    name: 'BAPER',
  },
];

const bannerSchema = yup.object().shape({
  image: yup.mixed().required('Gambar banner diharuskan untuk diisi'),
  name: yup.string().required('Nama diharuskan untuk diisi'),
  type: yup.string().required('Diharuskan untuk memilih tipe banner'),
  keterangan: yup.string().required('Deskripsi banner diharuskan untuk diisi'),
  value1: yup
    .string()
    .when('type', ([type]) =>
      type === 'tfsaldo' ? yup.string().required('Diharuskan untuk mengisi Zonapay ID pengguna') : yup.string(),
    ),
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
  id: string;
  image: any;
  keterangan: string;
  nama: string;
  index: number;
  type: string;
  value1: string;
}

function createData(
  id: string,
  image: any,
  keterangan: string,
  nama: string,
  index: number,
  type: string,
  value1: string,
): Data {
  return {
    id,
    image,
    keterangan,
    nama,
    index,
    type,
    value1,
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
    label: 'Banner',
    disableSort: false,
  },
  {
    id: 'value1',
    disablePadding: false,
    label: 'Zonapay ID',
    disableSort: true,
    align: 'left',
  },
  {
    id: 'type',
    disablePadding: false,
    label: 'Tipe',
    align: 'center',
    disableSort: true,
  },
  {
    id: 'image',
    disablePadding: false,
    label: 'Image',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'keterangan',
    disablePadding: false,
    label: 'Deskripsi',
    disableSort: true,
    align: 'left',
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
  selectedAdminType: string;
  id: string;
  image: any;
  keterangan: string;
  name: string;
  type: string;
  value1: string;
};

const Banner = () => {
  const dispatch = useAppDispatch();
  const { data, page, sortBy, sortType, limit, total, search, loadingPost, loadingDelete, loading, error } =
    useAppSelector((state) => state.bannerReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openImagePreview, setOpenImagePreview] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: '',
      image: '',
      keterangan: '',
      name: '',
      type: 'gambar',
      value1: '',
    },
    resolver: yupResolver(bannerSchema),
  });

  const { control, formState, handleSubmit, reset, setValue } = formMethods;
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
      selectedAdminType: '',
      id: '',
      image: '',
      keterangan: '',
      name: '',
      type: 'gambar',
    });
  };

  const selectedType = useWatch({ control, name: 'type' });

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData: FormType) => {
    const form = new FormData();
    form.append('image', typeof formData?.image === 'string' ? '' : formData?.image);
    form.append('keterangan', formData.keterangan);
    form.append('name', formData.name);
    form.append('type', `${formData.type}`);
    form.append('value1', formData.value1);
    form.append('id', formData.id);

    if (formData?.image && formData?.image instanceof Blob) {
      if (formData?.image?.size > 1048576) {
        dispatch(
          showMessage({
            message: 'Maximum photo file is 1 MB',
            variant: 'error',
          }),
        );
        setOpenEditConfirmation(false);
        return false;
      }
      if (
        formData?.image?.type !== 'image/jpeg' &&
        formData?.image?.type !== 'image/png' &&
        formData?.image?.type !== 'image/jpg'
      ) {
        dispatch(
          showMessage({
            message: 'File format must be in jpeg, jpg, or png',
            variant: 'error',
          }),
        );
        setOpenEditConfirmation(false);
        return false;
      }
    }
    if (editForm) {
      const response = await dispatch(editBannerData(formData?.id, form));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getBannerData());
      }
    } else {
      const response = await dispatch(addNewBannerData(form));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getBannerData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getBannerData());
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
        dispatch(getBannerData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row, index) =>
    createData(row?.id, row?.image, row?.keterangan, row?.nama, index, row?.type, row?.value1),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeBannerReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getBannerData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeBannerReducer({
          page: newPage,
        }),
      );
      dispatch(getBannerData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeBannerReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getBannerData());
  };

  const handleDeleteData = async (id: string) => {
    const response = await dispatch(deleteBannerData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getBannerData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const productImage = useWatch({ control, name: 'image' });

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
                changeBannerReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeBannerReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getBannerData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Daftar Banner
            </Typography>
            <Typography variant="body1">Manajemen untuk daftar banner</Typography>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
              Tambah Data
            </Button>
          </div>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(
                  changeBannerReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getBannerData());
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
                        <TableRow hover tabIndex={-1} key={index}>
                          <TableCell align="left" component="th" id={labelId} scope="row">
                            {row.id || '-'}
                          </TableCell>
                          <TableCell align="left">{row.nama || '-'}</TableCell>
                          <TableCell align="left">{row.value1 || '-'}</TableCell>
                          <TableCell align="center">{row.type || '-'}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={row?.image ? 'Preview' : 'No Image'}>
                              <span>
                                <IconButton
                                  disabled={!row?.image}
                                  onClick={() => {
                                    setOpenImagePreview(true);
                                    setSelectedImagePreview(`${import.meta.env.VITE_IMAGE_URL}${row.image}`);
                                  }}
                                  size="small"
                                  aria-label="preview"
                                  color="info"
                                >
                                  {row?.image ? (
                                    <ImageSearchOutlined fontSize="small" />
                                  ) : (
                                    <BrokenImage fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="left">{row.keterangan || '-'}</TableCell>
                          <TableCell align="center">
                            <section className="flex items-center justify-center gap-2">
                              <Tooltip title="Hapus">
                                <span>
                                  <IconButton
                                    disabled={loading}
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
                                    disabled={loading}
                                    onClick={() => {
                                      setSelectedId(row?.id);
                                      setEditForm(true);
                                      reset({
                                        id: row?.id || '',
                                        image: row?.image || '',
                                        keterangan: row?.keterangan || '',
                                        name: row?.nama || '',
                                        type: row?.type || 'gambar',
                                        value1: row?.value1 || '',
                                      });
                                      handleClickOpen();
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
            {editForm ? 'Edit Data Banner' : 'Data Banner Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Nama</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nama banner"
                        helperText={errors?.name && errors.name?.message}
                        error={!!errors?.name}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Jenis Banner</label>
                      <FormControl error={!!errors.type} required fullWidth>
                        <Select
                          input={<OutlinedInput />}
                          fullWidth
                          id="type-select"
                          placeholder="Pilih jenis banner"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const { value } = e.target;
                            setValue('value1', '');
                            field.onChange(value);
                          }}
                        >
                          <MenuItem disabled value="">
                            <em>Pilih jenis banner</em>
                          </MenuItem>
                          {typeList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors?.type?.message}</FormHelperText>
                      </FormControl>
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="image"
                  render={({ field: { onChange } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Pilih Gambar</label>
                      <section className="flex gap-3 items-stretch">
                        <TextField
                          onChange={(event: ChangeEvent) => {
                            const target = event.target as HTMLInputElement;
                            const file: File = (target.files as FileList)[0];
                            onChange(file);
                          }}
                          placeholder="Pilih gambar"
                          error={!!errors?.image}
                          helperText={'Disarankan dengan ukuran gambar 282x102 piksel'}
                          type="file"
                          fullWidth
                          inputProps={{
                            accept: 'image/png, image/jpg, image/jpeg',
                          }}
                        />
                        {productImage && (
                          <a
                            href={
                              typeof productImage === 'string'
                                ? `${import.meta.env.VITE_IMAGE_URL}${productImage}`
                                : productImage
                                ? URL.createObjectURL(productImage)
                                : ''
                            }
                            target="_blank"
                            rel="noreferrer"
                            className=" w-14 p-2 bg-slate-100 rounded-md"
                          >
                            <img
                              src={
                                typeof productImage === 'string'
                                  ? `${import.meta.env.VITE_IMAGE_URL}${productImage}`
                                  : productImage
                                  ? URL.createObjectURL(productImage)
                                  : ''
                              }
                              alt="product-preview"
                              className="object-contain w-full h-full"
                            />
                          </a>
                        )}
                      </section>
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                {selectedType === 'tfsaldo' && (
                  <Controller
                    control={control}
                    name="value1"
                    render={({ field }) => (
                      <div className="flex flex-col gap-3 w-full">
                        <label className="text-sm font-semibold">Nama</label>
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Masukkan nama banner"
                          helperText={errors?.value1 && errors.value1?.message}
                          error={!!errors?.value1}
                        />
                      </div>
                    )}
                  />
                )}
                <Controller
                  control={control}
                  name="keterangan"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Deskripsi</label>
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Masukkan deskripsi banner"
                        helperText={errors?.keterangan && errors.keterangan?.message}
                        error={!!errors?.keterangan}
                      />
                    </div>
                  )}
                />
              </div>
            </section>
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
          title={'Hapus data banner?'}
          content={`Konfirmasi untuk menghapus data banner dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenDeleteConfirmation(false)}
          confirmActionHandler={() => handleDeleteData(selectedId || '')}
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
          title={'Ubah data banner?'}
          content={`Konfirmasi untuk mengubah data banner dengan id ${selectedId}.`}
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

export default Banner;
