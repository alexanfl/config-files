#!/usr/bin/python

import argparse
import signal
import sys
from functools import partial

import i3ipc


def on_window(args, ipc, event):
    global focused_set

    tree = ipc.get_tree()
    focused = tree.find_focused()
    if focused is None:
        return

    focused_workspace = focused.workspace()

    focused.command("opacity " + args.focused)
    focused_set.add(focused.id)

    to_remove = set()
    for window_id in focused_set:
        if window_id == focused.id:
            continue
        window = tree.find_by_id(window_id)
        if window is None:
            to_remove.add(window_id)
        elif args.global_focus or window.workspace() == focused_workspace:
            window.command("opacity " + args.opacity)
            to_remove.add(window_id)

    focused_set -= to_remove


def remove_opacity(ipc, focused_opacity):
    for workspace in ipc.get_tree().workspaces():
        for w in workspace:
            w.command("opacity " + focused_opacity)
    ipc.main_quit()
    sys.exit(0)


def toggle_inactive_opacity(ipc, args, signum, frame):
    global focused_set

    # Toggle inactive opacity
    args.opacity = "1.0" if args.opacity != "1.0" else "0.8"

    tree = ipc.get_tree()
    focused = tree.find_focused()

    # Reset state so normal focus handling continues to work
    focused_set = set()

    for con in tree:
        if not con.window:
            continue
        if focused and con.id == focused.id:
            con.command("opacity " + args.focused)
            focused_set.add(con.id)
        else:
            con.command("opacity " + args.opacity)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Set transparency of unfocused windows in sway"
    )
    parser.add_argument(
        "--opacity",
        "-o",
        type=str,
        default="0.80",
        help="inactive opacity value (0–1)",
    )
    parser.add_argument(
        "--focused",
        "-f",
        type=str,
        default="1.0",
        help="focused opacity value (0–1)",
    )
    parser.add_argument(
        "--global-focus",
        "-g",
        action="store_true",
        help="only one opaque window across all workspaces",
    )
    args = parser.parse_args()

    ipc = i3ipc.Connection()
    focused_set = set()

    for window in ipc.get_tree():
        if window.focused:
            focused_set.add(window.id)
            window.command("opacity " + args.focused)
        else:
            window.command("opacity " + args.opacity)

    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda s, f: remove_opacity(ipc, args.focused))

    # Toggle inactive opacity with SIGUSR1
    signal.signal(
        signal.SIGUSR1,
        lambda s, f: toggle_inactive_opacity(ipc, args, s, f),
    )

    ipc.on("window", partial(on_window, args))
    ipc.main()
