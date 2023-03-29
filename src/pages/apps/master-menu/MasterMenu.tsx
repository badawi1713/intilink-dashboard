import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete, IconButton, TextField, Tooltip } from '@mui/material';
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
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewMenuData,
  changeMasterMenuReducer,
  deleteMenuData,
  editMenuData,
  getMasterMenuData,
  getMenuDetailData,
  getMenuListData,
} from 'src/store/actions/masters-action/menu-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const menuSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  link: yup.string().required('Link is required'),
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
  return {
    id,
    title,
    icon,
    link,
    deleted,
    parent_id,
    created_who,
    updated_who,
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
  title: string;
  parent_id: null | { id: number; title: string };
  icon: string;
  link: string;
};

const MasterMenu = () => {
  const dispatch = useAppDispatch();
  const { data, page, sortBy, sortType, limit, total, search, menuList } =
    useAppSelector((state) => state.masterMenuReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: 0,
      title: '',
      parent_id: null,
      icon: '',
      link: '',
    },
    resolver: yupResolver(menuSchema),
  });

  const { control, formState, handleSubmit, reset } = formMethods;
  const { errors } = formState;

  const handleClickOpen = () => {
    dispatch(getMenuListData());
    setOpenFormDialog(true);
  };
  const handleClose = () => {
    if (editForm) {
      setEditForm(false);
    }
    setOpenFormDialog(false);
    reset({
      id: 0,
      title: '',
      parent_id: null,
      icon: '',
      link: '',
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      title: data.title,
      icon: data.icon,
      link: data.link,
      parent_id: data.parent_id?.id || 0,
    };
    let response: boolean;
    if (editForm) {
      response = await dispatch(editMenuData(data?.id, payload));
      if (response) {
        handleClose();
        dispatch(getMasterMenuData());
      }
    } else {
      response = await dispatch(addNewMenuData(payload));
      if (response) {
        handleClose();
        dispatch(getMasterMenuData());
      }
    }
  });

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
    [dispatch, page]
  );

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(
      changeMasterMenuReducer({
        page: 0,
        limit: +event.target.value,
      })
    );
    dispatch(getMasterMenuData());
  };

  const getMenuListItem = (option: { id: number; title: string }) => {
    if (!option?.id) option = menuList?.find((op) => op.id === option);
    return option;
  };

  const handleDeleteMenu = (id: number) => {
    dispatch(deleteMenuData(id));
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
                  page: 0,
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
          <button
            onClick={handleClickOpen}
            className="w-auto bg-blue-600 border-2 border-blue-600 px-3 py-2 rounded-md text-white text-center text-sm font-semibold"
          >
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
                        <TableCell align="left">{row.title || '-'}</TableCell>
                        <TableCell align="left">{row.link || '-'}</TableCell>
                        <TableCell align="left">{row.icon || '-'}</TableCell>
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
                                  onClick={() => handleDeleteMenu(row.id)}
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
                                  onClick={async () => {
                                    const response = await dispatch(
                                      getMenuDetailData(row.id)
                                    );
                                    if (Object.keys(response).length > 0) {
                                      setEditForm(true);
                                      const selectedParentMenu =
                                        menuList?.find(
                                          (menu) =>
                                            menu?.id === response?.parent_id
                                        ) || null;
                                      reset({
                                        id: response?.id,
                                        title: response?.title,
                                        parent_id: selectedParentMenu,
                                        icon: response?.icon,
                                        link: response?.link,
                                      });
                                      handleClickOpen();
                                    }
                                  }}
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
      {openFormDialog && (
        <BootstrapDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={openFormDialog}
          maxWidth="md"
          fullWidth
        >
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={handleClose}
          >
            {editForm ? 'Edit Data Menu' : 'Data Menu Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Title</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type menu title"
                        helperText={errors?.title && errors.title?.message}
                        error={!!errors?.title}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="link"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Link</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type menu link"
                        helperText={errors?.link && errors.link?.message}
                        error={!!errors?.link}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="icon"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Icon</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type menu icon"
                        helperText={errors?.icon && errors.icon?.message}
                        error={!!errors?.icon}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="parent_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Parent</label>
                      <Autocomplete
                        onChange={(event, item) => {
                          onChange(item);
                        }}
                        id="parent_id"
                        value={value}
                        isOptionEqualToValue={(option, val) => {
                          return option?.id === getMenuListItem(val)?.id;
                        }}
                        fullWidth
                        options={menuList || []}
                        getOptionLabel={(item) =>
                          item.title ? item.title : ''
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={!!errors.parent_id}
                            helperText={errors?.parent_id?.message}
                            variant="outlined"
                            placeholder="Choose parent menu"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                  )}
                />
              </div>
            </section>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Batal</Button>
            <Button variant="contained" onClick={onSubmit}>
              Simpan
            </Button>
          </DialogActions>
        </BootstrapDialog>
      )}
    </>
  );
};

export default MasterMenu;
