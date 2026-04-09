// 批注，暂时不做

// import { useEffect, useMemo, useRef, useState } from 'react'
// import type { TextAreaRef } from 'antd/es/input/TextArea'
// import { Button, Input } from 'antd'
// import { Icon } from 'umi'
// import { nanoid } from 'nanoid'

// import type { Note } from '@/ppt/core'
// import { useMainStore, useSlidesStore } from '@/ppt/store'
// import MoveablePanel from '@/components/MoveablePanel'
// import styles from './NotesPanel.module.scss'

// export default function NotesPanel() {
//   const slideIndex = useSlidesStore((state) => state.slideIndex)
//   const currentSlide = useSlidesStore((state) => state.getCurrentSlide())
//   const updateSlide = useSlidesStore((state) => state.updateSlide)
//   const handleElementId = useMainStore((state) => state.handleElementId)
//   const setShowNotesPanel = useMainStore((state) => state.setShowNotesPanel)
//   const setActiveElementIdList = useMainStore((state) => state.setActiveElementIdList)

//   const [content, setContent] = useState('')
//   const [replyContent, setReplyContent] = useState('')
//   const [activeNoteId, setActiveNoteId] = useState('')
//   const [replyNoteId, setReplyNoteId] = useState('')

//   const textAreaRef = useRef<TextAreaRef | null>(null)
//   const notesRef = useRef<HTMLDivElement | null>(null)

//   const notes = useMemo(() => currentSlide?.remark || '', [currentSlide?.remark])

//   useEffect(() => {
//     setActiveNoteId('')
//     setReplyNoteId('')
//   }, [slideIndex])

//   const scrollToBottom = () => {
//     if (notesRef.current) {
//       notesRef.current.scrollTop = notesRef.current.scrollHeight
//     }
//   }

//   const createNote = () => {
//     if (!content) {
//       textAreaRef.current?.focus()
//       return
//     }

//     const newNote: Note = {
//       id: nanoid(),
//       content,
//       time: new Date().getTime(),
//       user: '测试用户',
//     }
//     if (handleElementId) newNote.elId = handleElementId

//     updateSlide({ notes: [...notes, newNote] })
//     setContent('')

//     setTimeout(scrollToBottom, 0)
//   }

//   const deleteNote = (id: string) => {
//     updateSlide({ notes: notes.filter((note) => note.id !== id) })
//   }

//   const createNoteReply = () => {
//     if (!replyContent) return

//     const currentNote = notes.find((note) => note.id === replyNoteId)
//     if (!currentNote) return

//     const newReplies = [
//       ...(currentNote.replies || []),
//       {
//         id: nanoid(),
//         content: replyContent,
//         time: new Date().getTime(),
//         user: '测试用户',
//       },
//     ]
//     const newNote: Note = {
//       ...currentNote,
//       replies: newReplies,
//     }
//     updateSlide({ notes: notes.map((note) => (note.id === replyNoteId ? newNote : note)) })

//     setReplyContent('')
//     setReplyNoteId('')

//     setTimeout(scrollToBottom, 0)
//   }

//   const deleteReply = (noteId: string, replyId: string) => {
//     const currentNote = notes.find((note) => note.id === noteId)
//     if (!currentNote || !currentNote.replies) return

//     const newReplies = currentNote.replies.filter((reply) => reply.id !== replyId)
//     const newNote: Note = {
//       ...currentNote,
//       replies: newReplies,
//     }
//     updateSlide({ notes: notes.map((note) => (note.id === noteId ? newNote : note)) })
//   }

//   const handleClickNote = (note: Note) => {
//     setActiveNoteId(note.id)

//     if (note.elId && currentSlide) {
//       const elIds = currentSlide.elements.map((item) => item.id)
//       if (elIds.includes(note.elId)) {
//         setActiveElementIdList([note.elId])
//       } else {
//         setActiveElementIdList([])
//       }
//     } else {
//       setActiveElementIdList([])
//     }
//   }

//   const clear = () => {
//     updateSlide({ notes: [] })
//   }

//   return (
//     <MoveablePanel
//       className={styles['notes-panel']}
//       width={300}
//       height={560}
//       title={`幻灯片${slideIndex + 1}的批注`}
//       left={-270}
//       top={90}
//       minWidth={300}
//       minHeight={400}
//       maxWidth={480}
//       maxHeight={780}
//       resizeable
//       onClose={() => setShowNotesPanel(false)}
//     >
//       <div className={styles.container}>
//         <div className={styles.notes} ref={notesRef}>
//           {notes.map((note) => (
//             <div
//               key={note.id}
//               className={`${styles.note} ${activeNoteId === note.id ? styles.active : ''}`}
//               onClick={() => handleClickNote(note)}
//             >
//               <div className={styles.header}>
//                 <div className={styles.user}>
//                   <div className={styles.avatar}><Icon icon="ri:user-3-line" /></div>
//                   <div className={styles['user-info']}>
//                     <div className={styles.username}>{note.user}</div>
//                     <div className={styles.time}>{new Date(note.time).toLocaleString()}</div>
//                   </div>
//                 </div>
//                 <div className={styles.btns}>
//                   <div className={`${styles.btn} ${styles.reply}`} onClick={() => setReplyNoteId(note.id)}>回复</div>
//                   <div className={`${styles.btn} ${styles.delete}`} onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}>删除</div>
//                 </div>
//               </div>
//               <div className={styles.content}>{note.content}</div>
//               {note.replies && note.replies.length > 0 && (
//                 <div className={styles.replies}>
//                   {note.replies.map((reply) => (
//                     <div key={reply.id} className={styles['reply-item']}>
//                       <div className={styles.header}>
//                         <div className={styles.user}>
//                           <div className={styles.avatar}><Icon icon="ri:user-3-line" /></div>
//                           <div className={styles['user-info']}>
//                             <div className={styles.username}>{reply.user}</div>
//                             <div className={styles.time}>{new Date(reply.time).toLocaleString()}</div>
//                           </div>
//                         </div>
//                         <div className={styles.btns}>
//                           <div className={`${styles.btn} ${styles.delete}`} onClick={(e) => { e.stopPropagation(); deleteReply(note.id, reply.id) }}>删除</div>
//                         </div>
//                       </div>
//                       <div className={styles.content}>{reply.content}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {replyNoteId === note.id && (
//                 <div className={styles['note-reply']}>
//                   <Input.TextArea
//                     value={replyContent}
//                     rows={1}
//                     placeholder="输入回复内容"
//                     onChange={(e) => setReplyContent(e.target.value)}
//                     onPressEnter={(e) => {
//                       e.preventDefault()
//                       createNoteReply()
//                     }}
//                   />
//                   <div className={styles['reply-btns']}>
//                     <Button className={styles.btn} size="small" onClick={() => setReplyNoteId('')}>取消</Button>
//                     <Button className={styles.btn} size="small" type="primary" onClick={createNoteReply}>回复</Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//           {!notes.length && <div className={styles.empty}>本页暂无批注</div>}
//         </div>
//         <div className={styles.send}>
//           <Input.TextArea
//             ref={textAreaRef}
//             value={content}
//             rows={2}
//             placeholder={`输入批注（为${handleElementId ? '选中元素' : '当前页幻灯片'}）`}
//             onChange={(e) => setContent(e.target.value)}
//             onFocus={() => { setReplyNoteId(''); setActiveNoteId('') }}
//             onPressEnter={(e) => {
//               e.preventDefault()
//               createNote()
//             }}
//           />
//           <div className={styles.footer}>
//             <Icon className={`${styles.btn} ${styles.icon}`} icon="ri:delete-bin-6-line" onClick={clear} />
//             <Button type="primary" className={styles.btn} onClick={createNote}>
//               <Icon icon="ri:add-line" /> 添加批注
//             </Button>
//           </div>
//         </div>
//       </div>
//     </MoveablePanel>
//   )
// }
