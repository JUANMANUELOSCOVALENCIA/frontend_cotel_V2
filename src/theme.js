// src/theme.js
// Ajustes de Material Tailwind.
// Al actualizar a 2.1.x, la librería cambió el color por defecto de azul a gris y oscureció
// la paleta "gray". Este tema restaura los colores de la 2.0.8 para que la app se vea igual.
// (Se genera comparando ambas versiones; no hace falta editarlo a mano.)

const theme = {
    alert: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                filled: {
                    gray: {
                        backgroud: "bg-gray-500"
                    }
                },
                gradient: {
                    gray: {
                        backgroud: "bg-gradient-to-tr from-gray-600 to-gray-400"
                    }
                },
                outlined: {
                    gray: {
                        border: "border border-gray-500",
                        color: "text-gray-700"
                    }
                },
                ghost: {
                    gray: {
                        backgroud: "bg-gray-500/20"
                    }
                }
            }
        }
    },
    avatar: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            borderColor: {
                gray: {
                    borderColor: "border-gray-500"
                }
            }
        }
    },
    button: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                filled: {
                    gray: {
                        background: "bg-gray-500",
                        shadow: "shadow-md shadow-gray-500/20",
                        hover: "hover:shadow-lg hover:shadow-gray-500/40"
                    }
                },
                gradient: {
                    gray: {
                        background: "bg-gradient-to-tr from-gray-600 to-gray-400",
                        shadow: "shadow-md shadow-gray-500/20",
                        hover: "hover:shadow-lg hover:shadow-gray-500/40"
                    }
                },
                outlined: {
                    gray: {
                        border: "border border-gray-500",
                        color: "text-gray-500",
                        focus: "focus:ring focus:ring-gray-200"
                    }
                },
                text: {
                    gray: {
                        color: "text-gray-500",
                        hover: "hover:bg-gray-500/10",
                        active: "active:bg-gray-500/30"
                    }
                }
            }
        }
    },
    card: {
        styles: {
            variants: {
                filled: {
                    gray: {
                        backgroud: "bg-gray-500",
                        shadow: "shadow-gray-500/40"
                    }
                },
                gradient: {
                    gray: {
                        backgroud: "bg-gradient-to-tr from-gray-600 to-gray-400",
                        shadow: "shadow-gray-500/40"
                    }
                }
            }
        }
    },
    cardHeader: {
        styles: {
            variants: {
                filled: {
                    gray: {
                        backgroud: "bg-gray-500",
                        shadow: "shadow-gray-500/40"
                    }
                },
                gradient: {
                    gray: {
                        backgroud: "bg-gradient-to-tr from-gray-600 to-gray-400",
                        shadow: "shadow-gray-500/40"
                    }
                }
            }
        }
    },
    checkbox: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            colors: {
                gray: {
                    background: "checked:bg-gray-500",
                    border: "checked:border-gray-500",
                    before: "checked:before:bg-gray-500"
                }
            }
        }
    },
    chip: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                filled: {
                    gray: {
                        backgroud: "bg-gray-500"
                    }
                },
                gradient: {
                    gray: {
                        backgroud: "bg-gradient-to-tr from-gray-600 to-gray-400"
                    }
                },
                outlined: {
                    gray: {
                        border: "border border-gray-500"
                    }
                },
                ghost: {
                    gray: {
                        backgroud: "bg-gray-500/20"
                    }
                }
            }
        }
    },
    iconButton: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                filled: {
                    gray: {
                        background: "bg-gray-500",
                        shadow: "shadow-md shadow-gray-500/20",
                        hover: "hover:shadow-lg hover:shadow-gray-500/40"
                    }
                },
                gradient: {
                    gray: {
                        background: "bg-gradient-to-tr from-gray-600 to-gray-400",
                        shadow: "shadow-md shadow-gray-500/20",
                        hover: "hover:shadow-lg hover:shadow-gray-500/40"
                    }
                },
                outlined: {
                    gray: {
                        border: "border border-gray-500",
                        color: "text-gray-500",
                        focus: "focus:ring focus:ring-gray-200"
                    }
                },
                text: {
                    gray: {
                        color: "text-gray-500",
                        hover: "hover:bg-gray-500/10",
                        active: "active:bg-gray-500/30"
                    }
                }
            }
        }
    },
    input: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                outlined: {
                    colors: {
                        input: {
                            gray: {
                                borderColorFocused: "focus:border-gray-500"
                            }
                        },
                        label: {
                            gray: {
                                color: "text-blue-gray-400 peer-focus:text-gray-500",
                                before: "before:border-blue-gray-200 peer-focus:before:!border-gray-500",
                                after: "after:border-blue-gray-200 peer-focus:after:!border-gray-500"
                            }
                        }
                    }
                },
                standard: {
                    colors: {
                        label: {
                            gray: {
                                color: "text-blue-gray-500 peer-focus:text-gray-500",
                                after: "after:border-gray-500 peer-focus:after:border-gray-500"
                            }
                        }
                    }
                },
                static: {
                    colors: {
                        input: {
                            gray: {
                                borderColorFocused: "focus:border-gray-500"
                            }
                        },
                        label: {
                            gray: {
                                color: "text-blue-gray-500 peer-focus:text-gray-500",
                                after: "after:border-gray-500 peer-focus:after:border-gray-500"
                            }
                        }
                    }
                }
            }
        }
    },
    progress: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                filled: {
                    gray: {
                        backgroud: "bg-gray-500"
                    }
                },
                gradient: {
                    gray: {
                        backgroud: "bg-gradient-to-tr from-gray-600 to-gray-400"
                    }
                }
            }
        }
    },
    radio: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            colors: {
                gray: {
                    color: "text-gray-500",
                    border: "checked:border-gray-500",
                    before: "checked:before:bg-gray-500"
                }
            }
        }
    },
    select: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                outlined: {
                    colors: {
                        select: {
                            gray: {
                                open: {
                                    borderColor: "border-gray-500"
                                }
                            }
                        },
                        label: {
                            gray: {
                                open: {
                                    color: "text-gray-500",
                                    before: "before:border-gray-500",
                                    after: "after:border-gray-500"
                                }
                            }
                        }
                    }
                },
                standard: {
                    colors: {
                        select: {
                            gray: {
                                open: {
                                    borderColor: "border-gray-500"
                                }
                            }
                        },
                        label: {
                            gray: {
                                open: {
                                    color: "text-gray-500",
                                    after: "after:border-gray-500"
                                }
                            }
                        }
                    }
                },
                static: {
                    colors: {
                        select: {
                            gray: {
                                open: {
                                    borderColor: "border-gray-500"
                                }
                            }
                        },
                        label: {
                            gray: {
                                open: {
                                    color: "text-gray-500",
                                    after: "after:border-gray-500"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    switch: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            colors: {
                gray: {
                    input: "checked:bg-gray-500",
                    circle: "peer-checked:border-gray-500",
                    before: "peer-checked:before:bg-gray-500"
                }
            }
        }
    },
    textarea: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                outlined: {
                    colors: {
                        textarea: {
                            gray: {
                                borderColorFocused: "focus:border-gray-500"
                            }
                        },
                        label: {
                            gray: {
                                color: "text-blue-gray-400 peer-focus:text-gray-500",
                                before: "before:border-blue-gray-200 peer-focus:before:!border-gray-500",
                                after: "after:border-blue-gray-200 peer-focus:after:!border-gray-500"
                            }
                        }
                    }
                },
                standard: {
                    colors: {
                        textarea: {
                            gray: {
                                borderColorFocused: "focus:border-gray-500"
                            }
                        },
                        label: {
                            gray: {
                                color: "text-blue-gray-500 peer-focus:text-gray-500",
                                after: "after:border-gray-500 peer-focus:after:!border-gray-500"
                            }
                        }
                    }
                },
                static: {
                    colors: {
                        textarea: {
                            gray: {
                                borderColorFocused: "focus:border-gray-500"
                            }
                        },
                        label: {
                            gray: {
                                color: "text-blue-gray-500 peer-focus:text-gray-500",
                                after: "after:border-gray-500 peer-focus:after:border-gray-500"
                            }
                        }
                    }
                }
            }
        }
    },
    buttonGroup: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            dividerColor: {
                gray: {
                    divideColor: "divide-gray-600"
                }
            }
        }
    },
    slider: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            colors: {
                gray: {
                    color: "text-gray-500"
                }
            }
        }
    },
    spinner: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            colors: {
                gray: {
                    color: "text-gray-500"
                }
            },
            base: {
                color: "text-blue-gray-100"
            }
        }
    },
    timelineItem: {
        defaultProps: {
            color: "blue"
        }
    },
    timelineIcon: {
        defaultProps: {
            color: "blue"
        },
        styles: {
            variants: {
                ghost: {
                    gray: {
                        color: "text-gray-500",
                        background: "bg-gray-500/10"
                    }
                },
                filled: {
                    gray: {
                        backgroud: "bg-gray-500"
                    }
                },
                outlined: {
                    gray: {
                        border: "border border-gray-500",
                        color: "text-gray-500"
                    }
                },
                gradient: {
                    gray: {
                        backgroud: "bg-gradient-to-tr from-gray-600 to-gray-400"
                    }
                }
            }
        }
    }
};

export default theme;
