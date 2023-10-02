import { useState } from 'react'
import dynamic from 'next/dynamic'
import moment from 'moment'
import cl from 'classnames'

import Avatar from '../../shared/Avatar'
import Modal from '../../shared/Modal'
import parseHTML from '../../../utils/functions/parseHTML'
import RatingStars from '../../shared/RatingStars'
import TextLink from '../../shared/TextLink'
import Checkbox from '../../shared/Checkbox'
import Button from '../../shared/Button'

const CKEditor = dynamic(() => import('../../../components/shared/CKEditor'), {
  ssr: false,
})

export const ReplyModal = ({ review, closeModal, submitReply }) => {
  const [reply, setReply] = useState('')
  const [isConfirmed, setConfirmed] = useState(false)
  const [errors, setErrors] = useState({
    isConfirmed: false,
    reply: false,
  })

  const onSubmit = () => {
    if (!isConfirmed) {
      setErrors({ ...errors, isConfirmed: true })
    }

    if (!reply.trim().length) {
      setErrors({ ...errors, reply: true })
    }

    if (isConfirmed && reply.trim().length) {
      submitReply(review.id, reply)
      closeModal(null)
    }
  }

  return (
    <Modal
      modalType="basic"
      basicModalTitle="Reply to review"
      onClose={() => closeModal(null)}
    >
      <div className="message reply-modal">
        <div className="author-info">
          <Avatar
            name={review.commenter.first_name}
            size="medium"
            src={review.commenter.avatarUrl}
          />
          <div>
            <div className="name">
              {review.commenter.first_name}
              {review.commenter.last_name[0].toUpperCase()}
            </div>
            <div className="date">
              <span>
                {moment(review.created_at, 'YYYY-MM-DD').format(
                  'MMMM DD, YYYY'
                )}
              </span>
              <span className="dot">&#183;</span>
              <span>{review.author_type}</span>
            </div>
          </div>
        </div>
        <RatingStars starsNumber={review.rating} />
        <div className={cl('text', 'sm', { fullMessage: true })}>
          {parseHTML(review.comment_text)}
        </div>
        <div>
          <h4>Leave a comment</h4>
          <CKEditor
            data={reply}
            onChange={(_, editor) => {
              const data = editor.getData()
              setReply(data)
              setErrors({ ...errors, reply: false })
            }}
          />
          {errors.reply && (
            <span className="error-message">This field is required</span>
          )}
        </div>
        <div className="confirm-review">
          <Checkbox
            id="confirm-review"
            isChecked={isConfirmed}
            onChange={() => {
              setConfirmed(!isConfirmed)
              setErrors({ ...errors, isConfirmed: false })
            }}
          />
          <label>
            I confirm that this comment is true and accurate and adheres to
            Cared Upon’s <TextLink text="review guidelines" url="#" />.
          </label>
          {errors.isConfirmed && (
            <span className="error-message">Confirm is required</span>
          )}
        </div>
        <Button title="Submit" type="secondary" onClick={onSubmit} />
      </div>
    </Modal>
  )
}
