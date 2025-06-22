use ic_cdk_macros::{update, query};
use candid::{CandidType, Deserialize};
use std::cell::RefCell;

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Task {
    pub id: u64,
    pub title: String,
    pub done: bool,
}

thread_local! {
    static TASKS: RefCell<Vec<Task>> = RefCell::new(Vec::new());
}

#[update]
pub async fn add_task(task: Task) -> bool {
    TASKS.with(|tasks| {
        tasks.borrow_mut().push(task);
    });
    true
}

#[query]
pub async fn get_tasks() -> Vec<Task> {
    TASKS.with(|tasks| tasks.borrow().clone())
}

#[update]
pub async fn complete_task(task_id: u64) -> bool {
    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        if let Some(t) = tasks.iter_mut().find(|t| t.id == task_id) {
            t.done = true;
            true
        } else {
            false
        }
    })
}

#[update]
pub async fn remove_task(task_id: u64) -> bool {
    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        let len_before = tasks.len();
        tasks.retain(|t| t.id != task_id);
        len_before != tasks.len()
    })
}

// NEW update_task method
#[update]
pub async fn update_task(task_id: u64, new_title: String, done: bool) -> Option<Task> {
    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        if let Some(t) = tasks.iter_mut().find(|t| t.id == task_id) {
            t.title = new_title;
            t.done = done;
            Some(t.clone())
        } else {
            None
        }
    })
}

ic_cdk::export_candid!();
