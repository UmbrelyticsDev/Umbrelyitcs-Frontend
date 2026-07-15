import { useState } from 'react';
// material
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@material-ui/core';
//


// ----------------------------------------------------------------------

export default function MUltiDeleteConfirmationPopUp({open,setOpen,handleMultiDelete}) {




  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Are You Sure?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          Do you want to delete these selected items?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleMultiDelete} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
