import { useState } from 'react'
import axios from 'axios'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Typography,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

const CATEGORIES = [
  'Technical issue',
  'Lesson content',
  'Account & billing',
  'Other',
]

// Mon–Fri 08:00–17:00 (local); drives only the copy shown, not the channel.
const isSupportOpen = () => {
  const n = new Date()
  return (
    [1, 2, 3, 4, 5].includes(n.getDay()) &&
    n.getHours() >= 8 &&
    n.getHours() < 17
  )
}

// Controlled Help modal — opened from the sidebar "Help" item.
export default function HelpWidget({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar()
  const [category, setCategory] = useState(CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {
    user = {}
  }
  const name =
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.user_name ||
    ''
  const email = user?.email || user?.user_name || ''

  const close = () => {
    setSubject('')
    setMessage('')
    setCategory(CATEGORIES[0])
    if (onClose) onClose()
  }

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      enqueueSnackbar('Please add a subject and a message.', {
        variant: 'warning',
      })
      return
    }
    setSending(true)
    try {
      await axios.post(
        `${REST_API_END_POINT}support`,
        {
          category,
          subject: subject.trim(),
          message: message.trim(),
          name,
          app: 'Umbrelytics',
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      )
      enqueueSnackbar("Message sent — we'll reply by email.", {
        variant: 'success',
      })
      close()
    } catch (e) {
      enqueueSnackbar(
        e.response?.data?.errors?.[0] ||
          "Couldn't send your message. Please try again.",
        { variant: 'error' },
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={!!open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Get help</DialogTitle>
      <DialogContent dividers>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
        >
          {isSupportOpen()
            ? 'Support is open — we usually reply within a few hours on weekdays.'
            : "Outside support hours — we'll reply the next business day."}
        </Typography>
        <TextField
          select
          fullWidth
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mb: 2 }}
        >
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {email && (
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', display: 'block', mt: 1 }}
          >
            We'll reply to {email}.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={sending}
          sx={{ color: '#fff' }}
        >
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
