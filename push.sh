#!/bin/bash

LOGFILE="push_log.txt"  # Log file name

# Print the start time
echo "Push started at $(date +'%Y-%m-%d %H:%M:%S')" >> $LOGFILE

# Add changes to git
echo "Adding changes..." >> $LOGFILE
git add . >> $LOGFILE 2>&1

# Commit the changes
COMMIT_MSG="Update $(date +'%Y-%m-%d %H:%M:%S')"
echo "Committing with message: $COMMIT_MSG" >> $LOGFILE
git commit -m "$COMMIT_MSG" >> $LOGFILE 2>&1

if [ $? -eq 0 ]; then
    echo "Commit successful." >> $LOGFILE
else
    echo "Commit failed. Exiting." >> $LOGFILE
    exit 1
fi

# Push the changes to GitHub
echo "Pushing to GitHub..." >> $LOGFILE
git push -u origin main >> $LOGFILE 2>&1

if [ $? -eq 0 ]; then
    echo "Push successful at $(date +'%Y-%m-%d %H:%M:%S')" >> $LOGFILE
else
    echo "Push failed. Exiting." >> $LOGFILE
    exit 1
fi

echo "Push finished at $(date +'%Y-%m-%d %H:%M:%S')" >> $LOGFILE
