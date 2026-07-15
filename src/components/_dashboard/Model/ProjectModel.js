import { Typography, Card } from '@material-ui/core'
import DialogProject from './DialogueProject'

export default function Modal({ open, handleClose, modalTitle, children }) {
  return (
    <DialogProject open={open} onClose={handleClose}>
      <Card sx={{ p: 3, maxWidth: 768, mx: 'auto' }}>
        <Typography variant="h6" sx={{ marginBottom: 3, textAlign: 'center' }}>
          {modalTitle}
        </Typography>
        {children}
      </Card>
    </DialogProject>   
  )
}