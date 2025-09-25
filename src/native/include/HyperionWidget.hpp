/* Hyperion source code edit control */
/* @file HyperionWidget.h
 * Definition of Hyperion widget for GTK+.
 * Only needed by GTK+ code but is harmless on other platforms.
 * This comment is not a doc-comment as that causes warnings from g-ir-scanner.
 */
/* Copyright 1998-2001 by Neil Hodgson <neilh@scintilla.org>
// Copyright 2025 by Ariz Kamizuki <ariz@mikofure.org>
 * The License.txt file describes the conditions under which this software may be distributed. */
#pragma once

#if defined(GTK)

#ifdef __cplusplus
extern "C" {
#endif

#define HYPERION(obj)          G_TYPE_CHECK_INSTANCE_CAST (obj, Hyperion_get_type (), HyperionObject)
#define HYPERION_CLASS(klass)  G_TYPE_CHECK_CLASS_CAST (klass, Hyperion_get_type (), HyperionClass)
#define IS_Hyperion(obj)       G_TYPE_CHECK_INSTANCE_TYPE (obj, Hyperion_get_type ())

#define HYPERION_TYPE_OBJECT             (Hyperion_object_get_type())
#define HYPERION_OBJECT(obj)             (G_TYPE_CHECK_INSTANCE_CAST((obj), Hyperion_TYPE_OBJECT, HyperionObject))
#define HYPERION_IS_OBJECT(obj)          (G_TYPE_CHECK_INSTANCE_TYPE ((obj), Hyperion_TYPE_OBJECT))
#define HYPERION_OBJECT_CLASS(klass)     (G_TYPE_CHECK_CLASS_CAST((klass), Hyperion_TYPE_OBJECT, HyperionObjectClass))
#define HYPERION_IS_OBJECT_CLASS(klass)  (G_TYPE_CHECK_CLASS_TYPE((klass), Hyperion_TYPE_OBJECT))
#define HYPERION_OBJECT_GET_CLASS(obj)   (G_TYPE_INSTANCE_GET_CLASS((obj), Hyperion_TYPE_OBJECT, HyperionObjectClass))

typedef struct _HyperionObject HyperionObject;
typedef struct _HyperionClass  HyperionObjectClass;

struct _HyperionObject {
	GtkContainer cont;
	void *pscin;
};

struct _HyperionClass {
	GtkContainerClass parent_class;

	void (* command) (HyperionObject *sci, int cmd, GtkWidget *window);
	void (* notify) (HyperionObject *sci, int id, SCNotification *scn);
};

GType		Hyperion_object_get_type		(void);
GtkWidget*	Hyperion_object_new			(void);
gintptr		Hyperion_object_send_message	(HyperionObject *sci, unsigned int iMessage, guintptr wParam, gintptr lParam);


GType		scnotification_get_type			(void);
#define HYPERION_TYPE_NOTIFICATION        (scnotification_get_type())

#ifndef G_IR_SCANNING
/* The legacy names confuse the g-ir-scanner program */
typedef struct _HyperionClass  HyperionClass;

GType		Hyperion_get_type	(void);
GtkWidget*	Hyperion_new		(void);
void		Hyperion_set_id	(HyperionObject *sci, uptr_t id);
sptr_t		Hyperion_send_message	(HyperionObject *sci,unsigned int iMessage, uptr_t wParam, sptr_t lParam);
void		Hyperion_release_resources(void);
#endif

#define HYPERION_NOTIFY "sci-notify"

#ifdef __cplusplus
}
#endif

#endif
