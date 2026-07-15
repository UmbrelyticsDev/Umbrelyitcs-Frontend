import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
// material
import {
  Dialog,
  IconButton,
  DialogContent,
  DialogTitle,
} from '@material-ui/core'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Icon } from '@iconify/react'
import CloseFill from '@iconify/icons-eva/close-fill'
import { varFadeInDown } from 'src/components/animate'
//


// ----------------------------------------------------------------------

DialogProject.propTypes = {
  open: PropTypes.bool.isRequired,
  animate: PropTypes.object,
  onClose: PropTypes.func,
  children: PropTypes.node.isRequired,
}

const AddDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
  },
  '& .MuiDialog-paperFullScreen': {
    background: `none !important`,
    padding: theme.spacing(0, 3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0, 1),
    },
  },
}))

const CloseBtn = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: `5%`,
  left: `50%`,
  transform: `translateX(-50%)`,
  height: `30px`,
  width: `30px`,
  borderRadius: `100%`,
  color: `#FFFFFF`,
  background: theme.palette.background.customGrey,
  padding: theme.spacing(0),
  '&:hover': {
    background: theme.palette.background.customGrey,
  },
}))
export default function DialogProject({
  open = false,
  animate,
  onClose,
  children,
  ...other
}) {
  return (
    <AnimatePresence>
      {open && (
        <AddDialog
          fullScreen
          scroll="body"
          open={open}
          onClose={onClose}
          onBackdropClick={()=>false}
          PaperComponent={motion.div}
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
            ...(animate || varFadeInDown),
          }}
          {...other}
        >
          <CloseBtn onClick={onClose}>
            <Icon icon={CloseFill} />
          </CloseBtn>
          <DialogTitle sx={{ py: 5 }} />
          <DialogContent>{children}</DialogContent>
        </AddDialog>
      )}
    </AnimatePresence>
  )
}